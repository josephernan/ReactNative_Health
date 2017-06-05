'use strict';

import React, {
  Component,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import {state} from '../storage';

class HomeScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => state('screen', 'LoginScreen')}>
          <Image source={require('./login.png')} />
        </TouchableOpacity>
        <Image source={require('./register.png')} />
        <View style={styles.hypeMessageContainer}>
          <Text style={styles.hypMessageText}>
            Take Control With Powerful Health Metrics Today!
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  hypeMessageContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  hypeMessageText: {
    textAlign: 'center'
  }
});

module.exports = HomeScreen;
