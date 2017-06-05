'use strict';

import React, {
  Animated,
  Component,
  ScrollView,
  View,
  Text,
  TouchableOpacity
}
from 'react-native';

let Icon = require('react-native-vector-icons/FontAwesome');

function getMaxValue(arr) {
  let max = 0;

  arr.forEach(function (item) {
    if (item.value > max) {
      max = item.value;
    }
  });

  return max;
}

class Histogram extends Component {
  // we store the bars in data so they don't keep animating on screen rotate
  state = {
    data: [],
    maxValue: 0
  };

  /**
   * Initialize the data and prepare to render them into bars
   */
  componentWillMount() {
    let {
      height,     // outer box height
      data,       // bar values
      showDates,  // show the dates at the top
      showValues  // show the values above the bar
    } = this.props;

    let maxValue = getMaxValue(data);

    this.state.maxValue = maxValue;

    // modify the data points with height measurements relative to the
    // height of the box they are in
    this.state.data = data.map(function (item, index) {
      let relativeHeight = ((height - (height / 6)) / maxValue) * item.value;

      // the bar height is different if no dates or values are displayed
      if (showDates === false && showValues === false) {
        relativeHeight = (height / maxValue) * item.value;
      }

      item.relativeHeight = relativeHeight;
      item.animatedHeight = new Animated.Value(1);
      return item;
    });
  }

  /**
   * Animate the bars up to their full height
   */
  componentDidMount() {
    this.props.data.forEach(function (item, index) {
      let relativeHeight = item.relativeHeight;
      setTimeout(function () {
        Animated.spring(item.animatedHeight, {toValue: relativeHeight}).start();
      }, (index + 1) * 50);
    });
  }

  render() {
    //
    // props
    //
    let {
      width,            // outer box width
      height,           // outer box height
      backgroundColor,  // the background of both inner and outer boxes
      icon,             // icon.name, icon.height
      barColor,         // vertical bars color
      outerStyle,       // override the outer style
      innerStyle,       // override the inner style
      barWidth,         // width of the vertical bars
      barSpacing,
      showDates,        // show dates at the top for each bar
      showValues,       // show values above each bar
      scrollEnabled,
      onPress
    } = this.props;

    let data = this.state.data;

    if (barSpacing === undefined) {
      barSpacing = 2;
    }

    if (barWidth === undefined) {
      barWidth = 5;
    }

    // create the bar elements
    let bars = data.map(function (item, index) {
      let formattedValue = item.value;

      if (formattedValue > 10000) {
        formattedValue = (Math.round(formattedValue / 100)).toString() + 'K';
        formattedValue = formattedValue.substring(0, 2) + '.' + formattedValue.substring(2);
      }

      let dateBox;

      //
      // date box at the top
      //
      if (showDates !== false) {
        dateBox = (
          <Text
            key={'chart-bar-date' + index}
            style={{
              flex: 1,
              alignSelf: 'center',
              fontFamily: 'OpenSans-Light',
              fontSize: 9,
              top: 3
            }}>
            {item.month} / {item.day}
          </Text>
        );
      }

      //
      // value box above the bar showing amount
      //
      let valueBox;

      if (showValues !== false) {
        valueBox = (
          <Text
            key={'chart-bar-value' + index}
            style={{
              alignSelf: 'center',
              fontSize: 9,
              marginBottom: 3,
              color: '#333333',
              textShadowOffset: {width: 1, height: 1},
              textShadowColor: '#FFFFFF',
              textShadowRadius: 1
            }}>
            {formattedValue}
          </Text>
        );
      }

      //
      // putting in this spacer makes the bar goto the bottom when no other
      // elements are in the column
      //
      let spacer;

      if (showDates === false && showValues === false) {
        spacer = (<View style={{flex: 1}} />);
      }

      return (
        <View
          key={'chart-column-container' + index}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            width: barWidth + barSpacing,
            height: height,
            transform: [
              {scaleX: -1}
            ]
          }}>
          {dateBox}
          {valueBox}
          {spacer}
          <Animated.View
            key={'chart-bar' + index}
            style={{
              position: 'relative',
              height: item.animatedHeight,
              bottom: 0,
              backgroundColor: barColor,
              marginRight: (barSpacing / 2),
              marginLeft: (barSpacing / 2)
            }} />
        </View>
      );
    });

    //
    // background icon floating underneith at the top right
    //
    let bgIcon;
    if (icon !== undefined) {
      // put background icon at top right
      bgIcon = (
        <Icon
          key={'chart-icon' + Math.random()}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            margin: barSpacing,
            transform: [
              {scaleX: -1}
            ]
          }}
          name={icon.name}
          color={icon.color}
          size={Math.floor(height / 1.3)} />
      );
    }

    //
    // put an invisible touchable over the whole chart
    //
    let pressOverlay;

    if (onPress !== undefined) {
      pressOverlay = (
        <TouchableOpacity
          onPress={onPress}
          style={{
            flex: 1,
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }} />
      );
    }

    return (
      <ScrollView
        scrollEnabled={scrollEnabled}
        horizontal={true}
        removeClippedSubviews={false}

        // outer box style
        style={[{
          backgroundColor: backgroundColor,
          width: width,
          height: height,
          transform: [
            {scaleX: -1}
          ]
        }, outerStyle]}

        // inner box style
        contentContainerStyle={[{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'flex-end'
        }, innerStyle]}>
        {bgIcon}
        {bars}
        {pressOverlay}
      </ScrollView>
    );
  }
}

module.exports = Histogram;
