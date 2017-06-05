'use strict';

import React, {
  Component,
  Text,
  TouchableOpacity
} from 'react-native';

let Icon = require('react-native-vector-icons/FontAwesome');

class ErrorMessage extends Component {
  render() {
    return (
      <TouchableOpacity
        style={{
          alignSelf: 'stretch',
          flexDirection: 'row',
          padding: 5,
          margin: 10,
          marginBottom: 5,
          borderRadius: 4,
          borderStyle: 'dotted',
          borderColor: 'rgb(100, 0, 0)',
          borderWidth: 1,
          backgroundColor: 'rgba(200, 0, 0, 0.2)'
        }}
        onPress={this.props.onPress}>
        <Text
          style={{
            flex: 1,
            color: '#660000',
            fontFamily: 'OpenSans-Light'
          }}>
          {this.props.message}
        </Text>
        <Icon
          style={{
            position: 'absolute',
            right: 7,
            top: 7
          }}
          name="close"
          size={16}
          color="#660000" />
      </TouchableOpacity>
    );
  }
}

module.exports = ErrorMessage;
