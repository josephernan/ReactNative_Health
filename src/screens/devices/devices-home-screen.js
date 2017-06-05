'use strict';

import React, {
  View,
} from 'react-native';
import JawbonePng from './resource/Jawbone.png';
import FitbitPng from './resource/Fitbit.png';
import RunKeeperPng from './resource/Run-Keeper.png';
import {state} from '../../storage';
import DeviceComponent from './device';

const DEVICES = [{
  thumb: JawbonePng,
  key: 'jawbone',
  title: 'Jawbone',
}, {
  thumb: FitbitPng,
  key: 'fitbit',
  title: 'Fitbit',
}, {
  thumb: RunKeeperPng,
  key: 'runkeeper',
  title: 'RunKeeper',
}];

module.exports = function DevicesHomeScreen() {
  return <View
    style={{
      width: state('window-width'),
      backgroundColor: 'e8e7e6',
      paddingTop: 10,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent : 'center',
    }}>
    {DEVICES.map(device=> <DeviceComponent key={device.key} device={device} />)}
  </View>;
};
