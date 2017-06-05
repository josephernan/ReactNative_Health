'use strict';

import _ from 'lodash';
import React, {
  PropTypes,
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import storage from '../../storage';
import Refresh from '../../components/refresh';
import Menu, {
  MenuContext,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-menu';
import {
  fromNowLong,
} from '../../utils/functions';
import * as fitbit from '../../utils/fitbit';
import {
  watchFitbitLastSyncDate,
  watchFitbitAccessToken,
  firebaseComponent,
} from '../../utils/firebase';

const {state} = storage;
const services = {
  fitbit,
  jawbone: {connect: _.noop},
  runkeeper: {connect: _.noop},
};

export default firebaseComponent([
  watchFitbitLastSyncDate,
  watchFitbitAccessToken,
], DeviceComponent);

DeviceComponent.propTypes = {
  device: PropTypes.shape({
    thumb: PropTypes.number.isRequired,
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};

function DeviceComponent(props) {
  const {device} = props;
  const {thumb, title} = device;
  const styles = buildStyles();
  const syncing = state(device.key + 'SyncState') === 'syncing';
  const connectionState = state(device.key + 'ConnectionState');
  const lastSyncDate = props[device.key + 'LastSyncDate'];
  const accessToken = props[device.key + 'AccessToken'];
  const service = services[device.key];
  return <View
    key={title}
    style={styles.listview_container}>
    <MenuContext style={{flex: 1}}>
      <View style={styles.row}>
        <Image style={styles.thumb} source={thumb} />
        <View style = {styles.toolView}>
          <Text style={[styles.corner, styles.text]}>
            {title}
          </Text>
          <View style={[styles.corner, styles.rightView]}>
            {accessToken ? <Refresh on={syncing} onPress={()=> service.sync(accessToken)} /> : null}
            <View style={{ padding: 10, flexDirection: 'row' }}>
              <Menu onSelect={onSelect}>
                <MenuTrigger>
                  <Icon
                    style={{
                      marginLeft: 3
                    }}
                    name="ellipsis-h"
                    size={16}
                    color="#7e7977" />
                </MenuTrigger>
                <MenuOptions>
                  {menuOptions()}
                </MenuOptions>
              </Menu>
            </View>
          </View>
        </View>
      </View>
    </MenuContext>
  </View>;

  function onSelect(value) {
    switch (value) {
      case 1:
        if (connectionState === 'connecting') {
          // do nothing
        } else if (accessToken) {
          service.disconnect();
        } else {
          service.connect();
        }
        break;
      case 2:
        if (!syncing && accessToken) {
          service.sync(accessToken);
        }
        break;
    }
  }
  function displayConnectText() {
    if (connectionState === 'connecting') {
      return 'Connecting';
    } else if (accessToken) {
      return 'Disconnect';
    } else {
      return 'Connect';
    }
  }
  function displaySyncText() {
    if (syncing) {
      return 'Syncing...';
    } else {
      return 'Sync';
    }
  }
  function menuOptions() {
    const options = [
      <MenuOption value={1} key={1}>
        <Text>{displayConnectText()}</Text>
      </MenuOption>,
    ];
    if (accessToken) {
      options.push(
        <MenuOption value={2} key={2}>
          <Text>{displaySyncText()}</Text>
        </MenuOption>
      );
    }
    if (lastSyncDate) {
      options.push(
        <MenuOption value={3} key={3}>
          <Text>Last sync {fromNowLong(lastSyncDate)}</Text>
        </MenuOption>
      );
    }
    return options;
  }
}

function buildStyles() {
  const screen = {
    width: state('window-width'),
    height: state('window-height'),
  };
  return StyleSheet.create({
    listview_container: {
      width: screen.width - 40,
      backgroundColor: 'transparent',
      marginLeft: 20,
      marginRight: 20,
      marginTop: 10,
    },
    button: {
      marginBottom: 40
    },
    row: {
      flexDirection: 'column',
      justifyContent: 'center',
      width: screen.width - 40,
      height:150,
      padding: 10,
      backgroundColor: 'transparent',
      alignItems:'center',
      borderRadius:5,
      marginBottom : 10,
    },
    toolView : {
      backgroundColor:'#d8d6d5',
      width:screen.width - 40,
      height:40,
    },
    separator: {
      height: 1,
      backgroundColor: 'transparent',
    },
    thumb: {
      width: screen.width - 40,
      height: 110,
    },
    text: {
      flex: 1,
      fontSize : 20,
      color : '#7e7977',
      left : 10,
      justifyContent: 'center',
    },
    corner: {
      top: 7,
      flex: 1,
      position: 'absolute',
      justifyContent: 'center',
    },
    rightView : {
      flex :1,
      justifyContent : 'center',
      right : 7,
      top:10,
      flexDirection:'row',
      alignItems:'center'
    },
    sync_bt : {
      flex : 1,
      marginRight : 10,
      alignSelf:'center'
    },
    tool_sync :{
      width : 18,
      height : 18,
    },
    more_bt : {
      flex : 1,
      alignSelf : 'center'
    },
    tool_more :   {
      width : 20,
      height : 9,
    },
  });
}
