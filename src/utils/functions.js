'use strict';

import {
  curry,
} from 'lodash';
import moment from 'moment';

export function arrayify(...args) {
  return args;
}

export const converge = curry(function converge(convergeFn, divergeFns) {
  return function(...args) {
    return convergeFn(...divergeFns.map(fn=> fn(...args)));
  };
});

export function fromCallback(cb) {
  return new Promise((resolve, reject)=> {
    cb((err, result)=> {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export function fromNowLong(date) {
  return moment(date).fromNow();
}

export function fromNowShort(date) {
  const fromNow = fromNowLong(date);
  if (fromNow === 'a few seconds ago') {
    return '1min';
  }
  const matches = fromNow.match(/^(an?|\d+) (.*?) ago$/);
  if (matches) {
    let [, num, measurement] = matches;
    if (num === 'a' || num === 'an') {
      num = 1;
      // remove the 's'
    } else {
      measurement = measurement.substring(0, measurement.length - 1);
    }
    measurement = (function() {
      switch (measurement) {
        case 'minute':
          return 'min';
        case 'hour':
          return 'hrs';
        case 'day':
          return 'day';
        case 'month':
          return 'mon';
        case 'year':
          return 'yrs';
        default:
          return measurement;
      }
    })();
    return `${num}${measurement}`;
  } else {
    return '';
  }
}
