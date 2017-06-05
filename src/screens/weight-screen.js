'use strict';

import React, {
  Component,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import {state} from '../storage';
let styleGuide = require('../style-guide');

class WeightScreen extends Component {
  render() {
    return (
      <View
        style={{
          marginTop: 30,
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontFamily: 'Montserrat',
            fontSize: 24
          }}>
          Weight
        </Text>
        <Text
          style={{
            marginTop: 20,
            fontFamily: 'OpenSans-Light',
            fontSize: 16
          }}>
          Coming Soon!
        </Text>
        <TouchableOpacity
          onPress={() => state('screen', 'FeedScreen')}
          style={{
            marginTop: 20,
            padding: 10,
            borderRadius: 4,
            backgroundColor: styleGuide.hues.blue
          }}>
          <Text
            style={{
              fontFamily: 'Montserrat',
              fontSize: 16,
              color: '#FFFFFF'
            }}>
            Back to Feed
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

module.exports = WeightScreen;
