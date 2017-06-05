'use strict';

import React, {
  Animated,
  Component,
  Text,
  PanResponder,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native';

import {state} from '../storage';
let styleGuide = require('../style-guide');
let Icon = require('react-native-vector-icons/FontAwesome');
import Menu, {
  MenuContext,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from 'react-native-menu';
let moment = require('moment');
let Histogram = require('../components/histogram');

function randomizedHourlyStepsData() {
  let index = 0;
  let today = moment();
  let op = [];

  for (; index < 24; index += 1) {
    op.push({
      hour: index,
      day: today.date(),
      month: today.month() + 1,
      value: Math.floor(Math.random() * (2000 - 200) + 200)
    });
  }

  return op;
}

let stepsData = randomizedHourlyStepsData();

function TrendRow(props) {
  let leftFlex = props.valuePercent / 100;
  let rightFlex = (1 - leftFlex);
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingTop: 5
      }}>
      <View
        style={{
          flex: 0.2,
          marginTop: 3
        }}>
        <Text
          style={{
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#b38934',
            alignSelf: 'flex-end',
            marginRight: 8
          }}>
          {props.caption}
        </Text>
      </View>
      <View
        style={{
          flex: 0.8,
          flexDirection: 'row'
        }}>
        <View
          style={{
            flex: leftFlex,
            backgroundColor: '#d69c2a',
            height: 25
          }} />
        <View
          style={{
            flex: rightFlex,
            backgroundColor: '#FFFFFF',
            height: 25
          }} />
      </View>
    </View>
  );
}

let unmanagedHourNumber = 0;

class StepsScreen extends Component {
  state = {
    scrolling: true,
    touchOpacity: new Animated.Value(0),
    touchPos: new Animated.ValueXY(),
    dataHourText: '--:--:--',
    dataHourNumber: 0,
    dataValue: '--',
    chartLeft: 0,
    chartWidth: 0,
    touchSliderWidth: 0
  };

  measure() {
    let {
      touchSlider,
      chart
    } = this.refs;

    chart.measure((ox, oy, width, height, px, py) => {
      this.setState({
        chartLeft: ox,
        chartWidth: width
      });
    });

    touchSlider.measure((ox, oy, width, height, px, py) => {
      this.setState({touchSliderWidth: width});
    });
  }

  componentWillMount() {
    // used for debouncing the hours text
    let hourTimer;

    this.coordinateResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        this.setState({scrolling: false});
        Animated.timing(this.state.touchOpacity, {toValue: 1, duration: 100}).start();
        return true;
      },
      onPanResponderMove: (evt, gestureState) => {
        let {
          chartLeft,
          chartWidth,
          touchSliderWidth,
          touchOpacity,
          dataHourNumber
        } = this.state;

        let halfTSWidth = (touchSliderWidth / 2);
        let x = (gestureState.moveX - touchSliderWidth + 3);
        let leftDisappear = (chartLeft - halfTSWidth - 10);
        let rightDisappear = (chartWidth + 10);
        let hourNumber = Math.floor((24 / chartWidth) * x);

        this.state.touchPos.x.setValue(x);

        /*console.log(
          'chartLeft', chartLeft,
          'chartWidth', chartWidth,
          'touchSliderWidth', touchSliderWidth,
          'touchOpacity', touchOpacity._value,
          'halfTSWidth', halfTSWidth,
          'x', x,
          'leftDisappear', leftDisappear,
          'rightDisappear', rightDisappear,
          'hourNumber', hourNumber
        );*/

        if (x < leftDisappear && touchOpacity._value === 1) {
          Animated.timing(touchOpacity, {toValue: 0, duration: 100}).start();
        }

        if (x > rightDisappear && touchOpacity._value === 1) {
          Animated.timing(touchOpacity, {toValue: 0, duration: 100}).start();
        }

        if (
          touchOpacity._value === 0 &&
          x > leftDisappear &&
          x < rightDisappear
        ) {
          Animated.timing(touchOpacity, {toValue: 1, duration: 100}).start();
        }

        // console.log('hourNumber', hourNumber);
        // console.log('dataHourNumber', dataHourNumber);

        if (
          hourNumber >= 0 &&
          hourNumber <= 24 &&
          hourNumber !== dataHourNumber
        ) {
          clearTimeout(hourTimer);
          hourTimer = setTimeout(() => {
            let ampm = 'am';
            let hourIndex = hourNumber;
            if (hourNumber > 11) {
              ampm = 'pm';
              if (hourNumber > 12) {
                hourNumber = (hourNumber % 12);
              }
            }
            if (hourNumber === 0) {
              console.log('zero hour');
              hourNumber = 12;
            }
            this.setState({
              dataValue: stepsData[hourIndex].value.toString(),
              dataHourNumber: hourNumber,
              dataHourText: hourNumber.toString() + ':00' + ampm
            });
          }, 50);
        }

        return true;
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        this.setState({scrolling: true});
        this.state.touchOpacity.setValue(0);
        return true;
      },
      onPanResponderTerminate: (evt, gestureState) => true,
      onShouldBlockNativeResponder: (evt, gestureState) => true
    });

    this.props.app.on('orientation', () => this.measure());
  }

  componentDidMount() {
    this.measure();
    setTimeout(() => this.measure(), 300);
  }

  render() {
    let {touchOpacity} = this.state;

    let topNavigation = (
      <View
        style={{
          // padding: 25
        }}>
        <View
          style={{
            flexDirection: 'row'
          }}>
          <TouchableOpacity
            style={{
              flex: 0.1,
            }}
            onPress={() => console.log('left')}>
            <Icon
              name="chevron-left"
              size={16}
              color="#fdd172" />
          </TouchableOpacity>
          <MenuContext
            style={{
              flex: 0.4
            }}>
            <Menu
              style={{
                top: -4,
                marginLeft: 30
              }}>
              <MenuTrigger>
                <Text
                  style={{
                    fontFamily: 'OpenSans',
                    fontSize: 16,
                    color: '#FFFFFF'
                  }}>
                  {moment().format('MMM D')}
                </Text>
              </MenuTrigger>
              <MenuOptions>

              </MenuOptions>
            </Menu>
          </MenuContext>
          <MenuContext
            style={{
              flex: 0.4,
              alignItems: 'flex-end'
            }}>
            <Menu
              style={{
                top: -4,
                marginRight: 30
              }}>
              <MenuTrigger
                style={{
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                <Text
                  style={{
                    fontFamily: 'OpenSans',
                    fontSize: 16,
                    color: '#FFFFFF'
                  }}>
                  By Day
                </Text>
                <Icon
                  style={{
                    marginLeft: 8
                  }}
                  name="caret-down"
                  size={16}
                  color="#FFFFFF" />
              </MenuTrigger>
              <MenuOptions>
                <MenuOption
                  style={{
                    borderColor: '#d8d6d5',
                    borderBottomWidth: 1
                  }}>
                  <Text
                    style={{
                      fontFamily: 'OpenSans',
                      fontSize: 14,
                      color: '#7e7977'
                    }}>
                    By Day
                  </Text>
                </MenuOption>
                <MenuOption>
                  <Text
                    style={{
                      fontFamily: 'OpenSans',
                      fontSize: 14,
                      color: '#7e7977'
                    }}>
                    By Month
                  </Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </MenuContext>
          <TouchableOpacity
            style={{
              flex: 0.1
            }}
            onPress={() => console.log('right')}>
            <Icon
              name="chevron-right"
              size={16}
              color="#fdd172" />
          </TouchableOpacity>
        </View>
      </View>
    );

    let chartWidth = 300;
    let barWidth = (chartWidth / 48);
    let chart = (
      <View ref="chart">
        <Histogram
          data={stepsData}
          width={chartWidth}
          height={199}
          backgroundColor={styleGuide.hues.orange}
          icon={{name: 'star', color: '#F4AE19'}}
          barColor={'rgba(255, 219, 124, 0.5)'}
          barWidth={barWidth}
          barSpacing={barWidth}
          showDates={false}
          showValues={false}
          scrollEnabled={false} />
      </View>
    );

    let chartBox = (
      <View
        style={{
          height: 200,
          alignItems: 'center',
          borderColor: '#fdd172',
          borderBottomWidth: 1
        }}>
        {chart}
        <View
          style={{
            flex: 1,
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            justifyContent: 'center'
          }}
          {...this.coordinateResponder.panHandlers}>
        </View>
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: this.state.touchPos.x,
            opacity: touchOpacity,
            flexDirection: 'column',
            alignItems: 'center'
          }}>
          <Text
            ref="touchSlider"
            style={{
              paddingTop: 1,
              paddingRight: 15,
              paddingBottom: 1,
              paddingLeft: 15,
              borderRadius: 4,
              backgroundColor: '#FFFFFF',
              flex: 0.1,
              fontFamily: 'OpenSans',
              fontSize: 11,
              color: '#f1a604'
            }}>
            {this.state.dataHourText}
          </Text>
          <View style={{
            flex: 0.9,
            width: 1,
            backgroundColor: '#FFFFFF',
            height: 180
          }} />
        </Animated.View>
      </View>
    );

    let dataNumbersBox = (
      <View
        style={{
          flexDirection: 'row',
          borderColor: '#fdd172',
          borderTopWidth: 1,
          borderBottomWidth: 1,
          marginTop: 15,
          paddingTop: 3,
          paddingBottom: 10
        }}>
        <Animated.View
          style={{
            flex: 0.5,
            flexDirection: 'column',
            alignItems: 'center'
          }}>
          <Text
            style={{
              fontFamily: 'Montserrat',
              fontSize: 24,
              color: '#FFFFFF'
            }}>
            {this.state.dataHourText}
          </Text>
          <Text
            style={{
              fontFamily: 'OpenSans',
              fontSize: 11,
              color: '#FFFFFF'
            }}>
            Time
          </Text>
        </Animated.View>
        <View
          style={{
            flex: 0.5,
            flexDirection: 'column',
            alignItems: 'center'
          }}>
          <Text
            style={{
              fontFamily: 'Montserrat',
              fontSize: 24,
              color: '#FFFFFF'
            }}>
            {this.state.dataValue}
          </Text>
          <Text
            style={{
              fontFamily: 'OpenSans',
              fontSize: 11,
              color: '#FFFFFF'
            }}>
            Steps
          </Text>
        </View>
      </View>
    );

    let trendBox = (
      <View
        style={{
          backgroundColor: '#fdd172',
          borderRadius: 4,
          padding: 15,
          marginTop: 15
        }}>
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: '#fcb316',
            paddingBottom: 5
          }}>
          <Text
            style={{
              fontFamily: 'Montserrat',
              fontSize: 24,
              color: '#FFFFFF'
            }}>
            Trend
          </Text>
        </View>
        <TrendRow caption="Today" valuePercent={40} />
        <TrendRow caption="Mon 1" valuePercent={50} />
        <TrendRow caption="Sun 31" valuePercent={60} />
        <TrendRow caption="Sat 30" valuePercent={30} />
        <TrendRow caption="Fri 29" valuePercent={80} />
      </View>
    );

    return (
      <ScrollView
        style={{
          backgroundColor: '#fcb316',
          padding: 25
        }}
        scrollEnabled={this.state.scrolling}>
        {topNavigation}
        {chartBox}
        {dataNumbersBox}
        {trendBox}
      </ScrollView>
    );
  }
}

module.exports = StepsScreen;
