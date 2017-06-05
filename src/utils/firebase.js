'use strict';

import React, {Component} from 'react-native';
import {
  noop,
  memoize,
  set,
} from 'lodash';
import storage from '../storage';

const STATE_KEY = Symbol('STATE_KEY');
const {remote, state} = storage;

export function activityChild() {
  return remote.child(`activity/${remote.getAuth().uid}`);
}

export function fitbitAccessTokenChild() {
  return remote.child(`fitbit_access_tokens/${remote.getAuth().uid}`);
}

export function userInfoChild() {
  return remote.child(`user_info/${remote.getAuth().uid}`);
}

export function avatarChild() {
  return userInfoChild().child('avatar');
}

export function emailChild() {
  return userInfoChild().child('email');
}

export const watchFitbitLastSyncDate = buildOnValueWatcher('fitbitLastSyncDate', ()=>
  activityChild().child('lastSyncDate')
);

export const watchEmail = buildOnValueWatcher('user-email', emailChild);
export const watchAvatar = buildOnValueWatcher('user-avatar', avatarChild);

export const watchFitbitAccessToken = buildOnValueWatcher('fitbitAccessToken', fitbitAccessTokenChild);

export const watchSteps = buildActivityWatcher('stepsLog', 'steps');
export const watchCalories = buildActivityWatcher('caloriesLog', 'calories');
export const watchWater = buildActivityWatcher('waterLog', 'water');
export const watchWeight = buildActivityWatcher('weightLog', 'weight');

export function firebaseComponent(listeners, ChildComponent) {
  return class FirebaseComponent extends Component {
    componentDidMount() {
      listeners.forEach(fn=> fn());
    }
    componentWillUnmount() {
      listeners.forEach(fn=> fn.stop());
    }
    render() {
      const props = listeners.reduce((accum, listener)=>
        set(accum, listener[STATE_KEY], state(listener[STATE_KEY]))
      , {});
      return <ChildComponent {...props} {...this.props} />;
    }
  };
}

function buildActivityWatcher(stateKey, type) {
  const onValueWatcher = buildOnValueWatcher(stateKey, buildQuery);

  onValueWatcher.withLimit = _.memoize(function(limit) {
    return buildOnValueWatcher(stateKey + limit, ()=> buildQuery(limit));
  });

  return onValueWatcher;

  function buildQuery(limit = 40) {
    return activityChild().child(type + '/days')
    .orderByKey()
    .limitToLast(limit);
  }
}

function buildOnValueWatcher(stateKey, queryFn) {
  return buildWatcher(stateKey, cb=> {
    const query = queryFn();
    query.on('value', onValue);
    return function() {
      query.off('value', onValue);
    };
    function onValue(snap) {
      cb(snap.val());
    }
  });
}

function buildWatcher(stateKey, buildQueryFn) {
  const watcher = watchManager(function upFn() {
    let cleanQuery = noop;
    remote.onAuth(onAuth);
    onAuth();
    return function downFn() {
      cleanQuery();
      remote.offAuth(onAuth);
    };
    function onAuth() {
      cleanQuery();
      const auth = remote.getAuth();
      if (auth) {
        cleanQuery = buildQueryFn(value=> {
          state(stateKey, value);
        });
      } else {
        state(stateKey, null);
        cleanQuery = noop;
      }
    }
  });
  watcher[STATE_KEY] = stateKey;
  return watcher;
}

function watchManager(upFn) {
  let downFn = noop;
  let numWatchers = 0;
  increaseWatchers.stop = decreaseWatchers;
  return increaseWatchers;
  function increaseWatchers() {
    if (numWatchers === 0) {
      downFn = upFn();
    }
    numWatchers++;
  }
  function decreaseWatchers() {
    numWatchers--;
    if (numWatchers === 0) {
      downFn();
      downFn = noop;
    }
  }
}
