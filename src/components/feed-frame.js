'use strict';

import React, {
  Component,
  Text,
  View
} from 'react-native';

let Icon = require('react-native-vector-icons/FontAwesome');

class FeedFrame extends Component {
  render() {
    let {
      backgroundColor,
      iconName,
      caption,
      outerStyle,
      borderColor
    } = this.props;

    if (borderColor === undefined) {
      borderColor = '#FFFFFF';
    }

    return (
      <View
        style={[{
          borderRadius: 4,
          backgroundColor: backgroundColor,
          padding: 5
        }, outerStyle]}>
        {this.props.children}
        <View style={{
            flexDirection: 'row',
            borderStyle: 'solid',
            borderColor: borderColor,
            borderTopWidth: 1
          }}>
          <Icon
            style={{
              // marginTop: 6,
              // marginLeft: 8
            }}
            name={iconName}
            size={23}
            color="#FFFFFF" />
          <Text
            style={{
              color: '#FFFFFF',
              // marginTop: 5,
              // marginLeft: 6,
              fontFamily: 'OpenSans-Bold',
              fontSize: 16
            }}>
            {caption}
          </Text>
        </View>
      </View>
    );
  }
}

module.exports = FeedFrame;
