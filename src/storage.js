'use strict';

import {AsyncStorage} from 'react-native';
import {fromCallback} from './utils/functions';
let mori = require('mori');
let Firebase = require('firebase');
let storage = {};

// set initial state here
let state = mori.toClj({
  // global use
  screen: 'LoginScreen',

  // login
  'login-sub-screen': 'sign in'
});

let history = mori.vector(state);
let app;

storage.local = function (key, val) {
  let callback;

  // get the value
  if (typeof val === 'function') {
    callback = val;

    return AsyncStorage.getItem(key, (err, text) => {
      let data;

      if (err !== undefined && err !== null) {
          console.error('error getting storage');
          return callback(err);
      }

      if (typeof text === 'string') {
        data = JSON.parse(text);
      }

      callback(undefined, data);
    });
  }

  // set the value
  AsyncStorage.setItem(key, JSON.stringify(val));
};

const whitelisted = [
  'screen-width',
  'AppLoaded',
  'login-sub-screen',
  'orientation',
  'screen',
  'window-height',
  'window-width',
];

storage.clearUserStorage = function() {
  for (let key in mori.toJs(state)) {
    if (whitelisted.indexOf(key) === -1) {
      storage.state(key, null, false);
    }
  }
  storage.state('screen', 'LoginScreen', true);
  return fromCallback(cb=> AsyncStorage.getAllKeys(cb))
  .then(keys=> {
    keys = keys.filter(key=> key.indexOf('fitbitActivity-') === 0);
    return fromCallback(cb=> AsyncStorage.multiRemove(keys, cb));
  });
};

/**
 * get and set the app state using immutable data structures
 * @param  {String} key
 * @param  {Object} val the value should be an immutable data structure
 * @param {Boolean} goEmit trigger app event, used for rendering
 * @return {[type]}     [description]
 */
storage.state = function (key, val, goEmit) {
  let newState;

  if (val !== undefined) {
    // create a new state merging in the change
    newState = mori.merge(state, mori.hashMap(key, mori.toClj(val)));

    // save it into history
    history = mori.conj(history, newState);

    // only keep 1000 steps
    if (mori.count(history) > 1000) {
      history = mori.rest(history);
    }

    // reset the current state
    state = newState;
    // console.log('--- set state ---');
    // console.log('history count', mori.count(history));
    // console.log('history', mori.toJs(history));

    // notify of changes
    if (app && (goEmit === undefined || goEmit === true)) {
      app.emit('state', key, val);
    }
  }

  return mori.toJs(mori.get(state, key));
};

storage.rewindState = function () {
  history = mori.pop(history);
  state = mori.last(history);
  // console.log('--- rewind ---');
  // console.log('history count', mori.count(history));
  // console.log('state', mori.toJs(state));
  app.emit('state');
};

storage.remote = new Firebase('https://burning-inferno-4943.firebaseio.com');

// storage needs a reference to the app instance to emit events
storage.attach = function (options) {
  app = options.app;
};

module.exports = storage;
