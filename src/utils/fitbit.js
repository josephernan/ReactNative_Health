'use strict';

import {
  merge,
  set,
  mapValues,
  unary,
  flow,
  padStart,
} from 'lodash';
import {
  converge,
  arrayify,
  fromCallback,
} from './functions';
import {
  activityChild,
  fitbitAccessTokenChild,
} from './firebase';
import {
  LinkingIOS,
} from 'react-native';
import qs from 'qs';
import storage from '../storage';

const TOKEN_LIFE = 2592000;
// steps, calories, water, weight
const BASE = 'https://fitbit.com/oauth2/authorize?' + qs.stringify({
  client_id: '227FNZ',
  response_type: 'token',
  scope: [
    'sleep',
    'weight',
    'nutrition',
    'heartrate',
    'activity',
  ].join(' '),
  expires_in: TOKEN_LIFE,
  redirect_uri: 'opal://fitbit-response',
}) + '&state=';


export function connect() {
  const exp_date = Date.now() + (TOKEN_LIFE * 1000);
  storage.state('fitbitConnectionState', 'connecting');
  const state = 'happy';
  const url = BASE + state;
  return openURL(url).then(callbackUrl=> {
    const {access_token, user_id} = qs.parse((new URL(callbackUrl)).hash.substring(1));
    return fromCallback(cb=> {
      fitbitAccessTokenChild().set({
        user_id,
        access_token,
        exp_date,
      }, cb);
    }).then(()=> {
      return {access_token, user_id};
    });
  })
  .then(result=> {
    clearConnectionState();
    return result;
  })
  .catch(error=> {
    clearConnectionState();
    throw error;
  })
  .then(sync)
  .catch(error=> {
    console.log('Connect error', error, error.stack);
  });

  function clearConnectionState() {
    storage.state('fitbitConnectionState', null);
  }
}

export function disconnect() {
  return fitbitAccessTokenChild().remove();
}

const runAll = converge(flow(arrayify, Promise.all));

const syncSteps = buildActivitySync('steps');
const syncCalories = buildActivitySync('calories');
const runSync = runAll([syncSteps, syncCalories, syncWater, syncWeight]);

export function sync({access_token, user_id}) {
  if (access_token) {
    storage.state('fitbitSyncState', 'syncing');
    return runSync(access_token, user_id).then(()=> {
      return fromCallback(cb=> {
        activityChild().child('lastSyncDate')
        .set(Date.now(), cb);
      });
    }).then(()=> {
      storage.state('fitbitSyncState', 'done');
      setTimeout(()=> storage.state('fitbitSyncState', null));
    });
  }
}

function buildActivitySync(type) {
  return runAll([syncHourly, syncDaily]);
  function syncHourly(access_token, user_id) {
    // Doesn't work yet
    //const yesterday = "2016-02-07";
    //return fitbitGet(access_token, user_id, `activities/${type}/date/${yesterday}/today/1min/time/12:30/1:30.json`)
    //.then(body=> {
    //  console.log('aba', body);
    //  return saveLocallyAndRemotely(type, 'hours', activities);
    //});
  }
  function syncDaily(access_token, user_id) {
    return fitbitGet(access_token, user_id, `activities/${type}/date/today/max.json`)
    .then(body=> {
      const activities = mapValues(toObject('dateTime', 'value', body[`activities-${type}`]), unary(parseInt));
      return saveLocallyAndRemotely(type, 'days', activities);
    });
  }
}

function saveLocallyAndRemotely(activity, period, value) {
  return Promise.all([
    fromCallback(cb=>
      activityChild().child(`${activity}/${period}`)
      .update(value, cb)
    ),
    mergeStorage(`fitbitActivity-${activity}-${period}`, value),
  ]);
}

function toObject(keyAttr, valueAttr, arr) {
  return arr.reduce((obj, entry)=>
    set(obj, entry[keyAttr], entry[valueAttr])
  , {});
}

function mergeStorage(storageKey, values) {
  return fromCallback(cb=> storage.local(storageKey, cb))
  .then(orig=> {
    storage.local(storageKey, merge(orig, values));
  });
}

function syncWater(access_token, user_id) {
  return fitbitGet(access_token, user_id, `foods/log/water/date/today/max.json`)
  .then(data=> {
    const activity = mapValues(toObject('dateTime', 'value', data['foods-log-water']), unary(parseFloat));
    return saveLocallyAndRemotely('water', 'days', activity);
  });
}

function syncWeight(access_token, user_id) {
  const today = getDate(new Date());
  return fitbitGet(access_token, user_id, `body/log/weight/date/${today}/1m.json`)
  .then(data=> {
    const activity = mapValues(toObject('date', 'weight', data.weight), unary(parseFloat));
    return saveLocallyAndRemotely('weight', 'days', activity);
  });
}

function getDate(date) {
  return [date.getFullYear()].concat([
    date.getMonth() + 1,
    date.getDate(),
  ].map(val=> padStart(val, 2, '0'))).join('-');
}

const API_BASE = 'https://api.fitbit.com/1/user/';
function fitbitGet(access_token, user_id, path) {
  const url = API_BASE + user_id + '/' + path;
  return fetch(url, {
    method: 'GET',
    mode: 'cors',
    headers: new Headers({
      Authorization: 'Bearer ' + access_token,
    }),
  }).then(result=> {
    return result.json();
  });
}

function openURL(requestUrl) {
  const promise = once(LinkingIOS, 'url', 2000);

  LinkingIOS.openURL(requestUrl);

  return promise.then(({url})=> url);
}

function once(object, eventName, timeoutMs) {
  return new Promise((resolve, reject)=> {
    object.addEventListener(eventName, handleEvent);
    const timeout = setTimeout(()=> {
      clean();
      reject(new Error('Timeout'));
    }, timeoutMs);
    return clean;
    function handleEvent(event) {
      clean();
      resolve(event);
    }
    function clean() {
      object.removeEventListener(eventName, handleEvent);
      clearTimeout(timeout);
    }
  });
}
