'use strict';

import React, {
  Component,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import _ from 'lodash';

let Histogram = require('../components/histogram');
let styleGuide = require('../style-guide');
import AvatarIcon from '../components/avatar-icon';
import moment from 'moment';
import {state} from '../storage';
import {
  firebaseComponent,
  watchSteps,
  watchCalories,
  watchWater,
  watchWeight,
} from '../utils/firebase';
let Icon = require('react-native-vector-icons/FontAwesome');

/**
 * An icon that can handle a press event
 * @param {Object} props.style override the outer box style
 * @param {String} props.name icon name
 * @param {Number} props.size icon size
 */
class TouchIcon extends Component {
  render() {
    return (
      <TouchableOpacity
        style={this.props.style}
        onPress={()=> this.props.onPress()}>
        <Icon
          name={this.props.name}
          size={this.props.size || 16}
          color="#FFFFFF" />
      </TouchableOpacity>
    );
  }
}

/**
 * Plus, minus, and more component
 * @param {Function} props.onPressPlus
 * @param {Function} props.onPressMinus
 * @param {Function} props.onPressMore
 * @returns {Component}
 */
class PlusMinusMore extends Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: 8,
          flexDirection: 'row',
          alignItems: 'flex-end'
        }}>
        <TouchIcon
          onPress={() => this.props.onPressPlus()}
          style={{marginRight: 20}}
          name="plus" />
        <TouchIcon
          onPress={() => this.props.onPressMinus()}
          name="minus" />
        <View style={{flex: 0.1}} />
        <TouchIcon
          onPress={() => this.props.onPressMore()}
          name="ellipsis-h" />
      </View>
    );
  }
}

/**
 * Boxes for below the primary item that have +, -, and more
 * @param {String} props.backgroundColor
 * @param {String} props.dataValue       the text to display in the middle
 * @param {String} props.caption         a title describing the data value
 * @param {String} props.iconName        the FontAwesome icon name
 * @param {String} props.dividerColor    color for the divider border
 * @param {Function} props.onPressData   the user presses the data value
 * @param {Function} props.onPressPlus   the user presses the plus icon
 * @param {Function} props.onPressMinus  the user presses the minus icon
 * @param {Function} props.onPressMore   the user presses the ellipsis icon
 * @returns {Component}
 */
class PlusMinusDataItem extends Component {
  render() {
    return (
      <View
        style={{
          flex : 1,
          backgroundColor: this.props.backgroundColor,
          borderRadius: 4,
          paddingTop: 10,
          paddingRight: 20,
          paddingBottom: 0,
          paddingLeft: 20
        }}>
        <View>
          <Text
            style={{
              alignSelf: 'center',
              fontFamily: 'Montserrat',
              fontSize: 36,
              color: '#FFFFFF'
            }}>
            {this.props.dataValue}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingBottom: 10
            }}>
            <Icon
              style={{
                top: 3,
                marginRight: 5
              }}
              name={this.props.iconName}
              size={16}
              color="#FFFFFF" />
            <Text
              style={{
                fontFamily: 'Montserrat',
                fontSize: 16,
                color: '#FFFFFF'
              }}>
              {this.props.caption}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => this.props.onPressData()}
            style={{
              flex: 1,
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0
            }} />
        </View>
        <View
          style={{
            borderColor: this.props.dividerColor,
            borderStyle: 'solid',
            borderTopWidth: 1,
            flexDirection: 'row'
          }}>
          <PlusMinusMore
            onPressPlus={this.props.onPressPlus}
            onPressMinus={this.props.onPressMinus}
            onPressMore={this.props.onPressMore} />
        </View>
      </View>
    );
  }
}

class DataPill extends Component {
  render() {
    return (
      <View
        style={{
          backgroundColor: this.props.backgroundColor,
          borderRadius: 4,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          marginRight: 10,
          marginBottom: 10,
          padding: 5
        }}>
        <Text
          style={{
            fontFamily: 'Montserrat',
            fontSize: 16,
            color: '#FFFFFF'
          }}>
          {this.props.dataValue}
        </Text>
        <View
          style={{
            flexDirection: 'row'
          }}>
          <Icon
            style={{
              top: 3,
              marginRight: 4
            }}
            name={this.props.iconName}
            size={12}
            color="#FFFFFF" />
          <Text
            style={{
              fontFamily: 'OpenSans-Light',
              fontSize: 12,
              color: '#FFFFFF'
            }}>
            {this.props.caption}
          </Text>
        </View>
      </View>
    );
  }
}

class StreamItem extends Component {
  render() {
    return (
      <View
        style={{
          margin: 8,
          borderColor: '#d8d6d5',
          borderStyle: 'solid',
          borderTopWidth: 1,
          paddingTop: 12,
          paddingBottom: 12,
          flexDirection: 'row'
        }}>
        <View
          style={{
            flex: 0.18
          }}>
          {this.props.icon}
        </View>
        <View
          style={{
            flex: 0.82
          }}>
          <Text
            style={{
              fontFamily: 'Montserrat',
              fontSize:16,
              color: '#434343',
              marginBottom: 5
            }}>
            {this.props.caption}
          </Text>
          {this.props.children}
        </View>
      </View>
    );
  }
}

/**
 * Put the commas in a number
 * @param  {Number} num
 * @return {String} formatted number
 */
function numberFormat(num) {
  num = num.toString();

  const [whole, decimal] = num.split('.');
  return [rightGroup(whole).join(',') || '0', decimal].filter(_.identity).join('.');
}

function rightGroup(str, groupLength) {
  let i = str.length;
  let groups = [];
  do {
    groups.unshift(str.substring(i - 3, i));
    i -= 3;
  } while(i > 0);
  return groups;
}

const StepsChart = firebaseComponent([
  watchSteps,
], function StepsChart({stepsLog}) {

  const stepsData = _(stepsLog).map((value, key)=> {
    const [, month, day] = key.split('-').map(_.unary(parseInt));
    return {
      fulldate: new Date(key).toString(),
      month,
      day,
      value,
    };
  }).sortBy(({fulldate})=> new Date(fulldate)).reverse().value();

  return stepsData && stepsData.length ? <View
    style={{
      backgroundColor: styleGuide.hues.orange,
      borderRadius: 4,
      paddingTop: 20,
      paddingRight: 20,
      paddingBottom: 15,
      paddingLeft: 20
    }}>
    <Histogram
      data={stepsData}
      height={150}
      backgroundColor={styleGuide.hues.orange}
      icon={{name: 'star', color: '#F4AE19'}}
      barColor={'rgba(255, 219, 124, 0.5)'}
      barWidth={6}
      barSpacing={2}
      showDates={false}
      showValues={false}
      scrollEnabled={false}
      onPress={() => state('screen', 'StepsScreen')} />
    <View
      style={{
        borderColor: '#fdd172',
        borderStyle: 'solid',
        borderTopWidth: 1,
        paddingTop: 5,
        flexDirection: 'row'
      }}>
      <Icon
        style={{
          top: 4,
          marginRight: 15
        }}
        name="star"
        size={24}
        color="#FFFFFF" />
      <Text
        style={{
          fontFamily: 'Montserrat',
          fontSize: 24,
          color: '#FFFFFF',
        }}>
        {numberFormat(stepsData[stepsData.length - 1].value)} steps
      </Text>
      <View style={{flex: 0.1}} />
      <TouchIcon
        onPress={(e) => console.log('steps menu') && e.preventDefault()}
        style={{
          top: 4
        }}
        size={24}
        name="ellipsis-h" />
    </View>
  </View> : <View />;
});

const calendarFormat = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[Yesterday]',
  lastWeek: '[Last] dddd',
  sameElse: 'MM/DD/YYYY'
};

const StreamItems = firebaseComponent([
  watchSteps,
  watchCalories,
  watchWater,
  watchWeight,
], function StreamItems({stepsLog, caloriesLog, waterLog, weightLog}) {
  let index = -1;
  const pillIndex = [{
    log: stepsLog,
    iconName: 'star',
    caption: 'Steps',
    color: 'orange',
  }, {
    log: caloriesLog,
    iconName: 'fire',    caption: 'Calories',

    color: 'pink',
  }, {
    log: waterLog,
    iconName: 'tint',
    caption: 'Water (cups)',
    color: 'blue',
  }, {
    log: weightLog,
    iconName: 'balance-scale',
    caption: 'Weight (lbs)',
    color: 'green',
  }];
  const items = _(stepsLog).toPairs().sortBy(0).map(([date, value])=> {
    index++;
    const fulldate = moment(date, 'YYYY-MM-DD').calendar(moment(), calendarFormat);
    const pills = pillIndex.map(({log, iconName, caption, color})=> {
      return log && log[date] && <DataPill
        key={caption}
        backgroundColor={styleGuide.hues[color]}
        dataValue={numberFormat(log[date])}
        iconName={iconName}
        caption={caption} />;
    }).filter(_.identity);
    return (
      <StreamItem
        key={'stream-item-' + date}
        icon={<AvatarIcon />}
        caption={fulldate}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}>
          {pills}
        </View>
      </StreamItem>
    );
  }).reverse().value();
  return <View>{items}</View>;
});
function getToday() {
  const today = new Date();
  return [today.getFullYear()].concat([
    today.getMonth() + 1,
    today.getDate(),
  ].map(val=> _.padStart(val, 2, '0'))).join('-');
}

function getTodaysValue(object) {
  const [[date, value]] = !object || !Object.keys(object).length ? [[]] : _.toPairs(object);
  return date !== getToday() ? 0 : value;
}

const CalorieEditor = firebaseComponent([
  watchCalories.withLimit(1),
], function CalorieEditor({caloriesLog1}) {
  const value = getTodaysValue(caloriesLog1);
  return <PlusMinusDataItem
    backgroundColor={styleGuide.hues.pink}
    dividerColor="#ae3c6d"
    iconName="fire"
    dataValue={numberFormat(value)}
    caption="Calories"
    onPressData={() => state('screen', 'CaloriesScreen')}
    onPressPlus={() => state('screen', 'CaloriesScreen')}
    onPressMinus={() => state('screen', 'CaloriesScreen')}
    onPressMore={() => state('screen', 'CaloriesScreen')} />;
});

const WaterEditor = firebaseComponent([
  watchWater.withLimit(1),
], function WaterEditor({waterLog1}) {
  const value = getTodaysValue(waterLog1);
  return <PlusMinusDataItem
    backgroundColor={styleGuide.hues.blue}
    dividerColor="#d8d6d5"
    iconName="tint"
    dataValue={numberFormat(value)}
    caption="Water (cups)"
    onPressData={() => state('screen', 'WaterScreen')}
    onPressPlus={() => state('screen', 'WaterScreen')}
    onPressMinus={() => state('screen', 'WaterScreen')}
    onPressMore={() => state('screen', 'WaterScreen')} />;
});

const WeightEditor = firebaseComponent([
  watchWeight.withLimit(1),
], function WeightEditor({weightLog1}) {
  const value = _.values(weightLog1)[0];
  let value_real = typeof value === 'undefined' ? 0 :value;
  return     <PlusMinusDataItem
      backgroundColor={styleGuide.hues.green}
      dividerColor="#49995e"
      iconName="balance-scale"
      dataValue={numberFormat(value_real)}
      caption="Weight (lbs)"
      onPressData={() => state('screen', 'WeightScreen')}
      onPressPlus={() => state('screen', 'WeightScreen')}
      onPressMinus={() => state('screen', 'WeightScreen')}
      onPressMore={() => state('screen', 'WeightScreen')} />;
});

class FeedScreen extends Component {
  render() {
    //
    // steps frame
    //
    let feedFrame1 = <StepsChart />;

    //
    // connect a device
    //
    let deviceFrame = (
      <View
        style={{
          flex: 1,
          borderColor: '#d8d6d5',
          borderStyle: 'dashed',
          borderWidth: 5,
          justifyContent: 'center',
          alignItems: 'stretch',
          padding: 15
        }}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'space-around'
          }}>
          <Text
            style={{
              fontFamily: 'Montserrat',
              fontSize: 16,
              color : '#dedede'
            }}>
            Connect a
          </Text>
          <Text
            style={{
              fontFamily: 'Montserrat',
              fontSize: 16,
              color : '#dedede'
            }}>
            Device
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => state('screen', 'DevicesHomeScreen')}
          style={{
            flex: 1,
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }} />
      </View>
    );

    //
    // calories frame
    //
    let feedFrame2 = <CalorieEditor />

    //
    // water - / + frame
    //
    let feedFrame3 = <WaterEditor />

    //
    // weight + -
    //
    let feedFrame4 = <WeightEditor />

    const streamItems = <StreamItems />;

    return (
      <View
        style={{
          flex: 1,
          padding: 14,
          backgroundColor: styleGuide.grays.light
        }}>
        {feedFrame1}
        <View
          style={{
            flexDirection: 'row',
            marginTop: 12,
            height: 120
          }}>
          {deviceFrame}
          <View style={{ width : 14}} />
          {feedFrame2}
        </View>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 14,
            height: 120
          }}>
          {feedFrame3}
          <View style={{ width : 14}} />
          {feedFrame4}
        </View>

        <View
        style={{flex : 0.1, marginTop : 2, marginBottom : 2, backgroundColor : '#d8d6d5'}}/>

        {streamItems}
      </View>
    );
  }
}

module.exports = FeedScreen;
