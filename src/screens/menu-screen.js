'use strict';

import React, {
  Animated,
  Component,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import {local, state, remote} from '../storage';
import {
  watchFitbitLastSyncDate,
  watchFitbitAccessToken,
  watchEmail,
  watchAvatar,
} from '../utils/firebase';
import {
  fromNowShort,
} from '../utils/functions';
import {
  sync,
} from '../utils/fitbit';

let styleGuide = require('../style-guide');
let Icon = require('react-native-vector-icons/FontAwesome');
let MenuItem = require('../components/menu-item');

let windowWidth;
let windowHeight;
let orientation;
let menuLeft = new Animated.Value(-2000);
let menuMode = 'closed';

class MenuScreen extends Component {
  dimensions() {
    windowWidth = state('window-width');
    windowHeight = state('window-height');
    orientation = state('orientation');
  }

  close() {
    this.dimensions();
    Animated.timing(menuLeft, {toValue: (-windowWidth)}).start();
    menuMode = 'closed';
  }

  open() {
    this.dimensions();

    if (menuLeft._value === -2000) {
      menuLeft.setValue(-windowWidth);
    }

    Animated.timing(menuLeft, {toValue: 0}).start();
    menuMode = 'opened';
  }

  toggle() {
    this.dimensions();

    if (menuMode === 'closed') {
      return this.open();
    }

    this.close();
  }

  goTo(route) {
    this.close();
    state('screen', route);
  }

  reorient(o) {
    orientation = o;
    this.dimensions();

    if (menuMode === 'opened') {
      menuLeft.setValue(0);
    }

    if (menuMode === 'closed') {
      menuLeft.setValue(-windowWidth);
    }

    // upside down is too glitchy, just close it
    if (orientation === 'PORTRAITUPSIDEDOWN') {
      this.close();
    }
  }

  componentWillMount() {
    let {app} = this.props;
    let update = () => this.forceUpdate();

    app.on('toggle-menu', () => this.toggle());
    app.on('orientation', (o) => this.reorient(o));

  }

  componentDidMount() {
    watchFitbitLastSyncDate();
    watchFitbitAccessToken();
    watchEmail();
    watchAvatar();
  }

  componentWillUnmount() {
    watchFitbitLastSyncDate.stop();
    watchFitbitAccessToken.stop();
    watchEmail.stop();
    watchAvatar.stop();
  }

  signOut() {
    this.close();
    remote.unauth();
  }

  render() {

    const fitbitSyncState = state('fitbitSyncState');
    const lastSyncDate = state('fitbitLastSyncDate');
    const accessToken = state('fitbitAccessToken');
    const avatarUrl = state('user-avatar');
    const email = state('user-email');

    let avatarElement;
    let displayNameElement;
    let profileMenuItem;
    let syncMenuItem;
    let devicesMenuItem;
    let feedMenuItem;

    this.dimensions();

    if (avatarUrl && avatarUrl.length > 0) {
      avatarElement = (
        <Image
          style={{
            width: 74,
            height: 74,
            borderRadius: 37,
            alignSelf: 'center',
            justifyContent: 'center',
            marginTop: 10
          }}
          source={{uri: avatarUrl}} />
      );
    }

    if (email && email.length > 0) {
      displayNameElement = (
        <Text
          style={{
            color: '#d8d6d5',
            fontFamily: 'Montserrat',
            fontSize: 24,
            alignSelf: 'center',
            justifyContent: 'center',
            marginTop: 10,
            marginBottom: 20,
          }}>
          {email}
        </Text>
      );
    }

    profileMenuItem = (
      <View
        style={{
          flexDirection: 'row',
          borderColor: '#7E7977',
          borderStyle: 'solid',
          borderBottomWidth: 1,
          paddingBottom: 18
        }}>
        <Icon
          style={{
            marginLeft: 3
          }}
          name="user"
          size={16}
          color="#d8d6d5" />
        <Text
          style={{
            color: '#d8d6d5',
            fontFamily: 'OpenSans-Light',
            fontSize: 16,
            marginLeft: 15,
            marginTop: -2
          }}>
          Profile
        </Text>
      </View>
    );

    feedMenuItem = (
      <TouchableOpacity onPress={()=> this.goTo('FeedScreen')}>
        <View
          style={{
            flexDirection: 'row',
            borderColor: '#7E7977',
            borderStyle: 'solid',
            borderBottomWidth: 1,
            paddingBottom: 18,
            paddingTop: 18,
          }}>
          
          <Icon
            style={{
              marginLeft: 3
            }}
            name="home"
            size={16}
            color="#d8d6d5" />
          <Text
            style={{
              color: '#d8d6d5',
              fontFamily: 'OpenSans-Light',
              fontSize: 16,
              marginLeft: 15,
              marginTop: -2
            }}>
            Feed
          </Text>
          
        </View>
      </TouchableOpacity>
    );

    syncMenuItem = accessToken ? (()=> {
      const view = <View
        style={{
          flexDirection: 'row',
          borderColor: '#7E7977',
          borderStyle: 'solid',
          borderBottomWidth: 1,
          marginTop: 18,
          paddingBottom: 18
        }}>
        <Icon
          style={{
            marginLeft: 5
          }}
          name="lightbulb-o"
          size={16}
          color="#d8d6d5" />
        <Text
          style={{
            color: '#d8d6d5',
            fontFamily: 'OpenSans-Light',
            fontSize: 16,
            marginLeft: 15,
            marginTop: -2
          }}>
          {fitbitSyncState === 'syncing' ? 'Syncing FitBit...' : 'Sync FitBit'}
        </Text>
        {fitbitSyncState === null ?
        <View
          style={{
            backgroundColor: styleGuide.hues.green,
            borderRadius: 4,
            position: 'absolute',
            right: 10,
            paddingTop: 3,
            paddingRight: 15,
            paddingBottom: 3,
            paddingLeft: 15,
          }}>
          <Text
            style={{
              color: '#FFFFFF',
              fontFamily: 'Arial',
              fontWeight: 'bold',
              fontSize: 12
            }}>
            {fromNowShort(lastSyncDate)}
          </Text>
        </View>
        : null}
      </View>;
      return fitbitSyncState === null ?
        <TouchableOpacity
          onPress={()=> sync(accessToken)}>
          {view}
        </TouchableOpacity>
      :
        view;
    })() : null;

    devicesMenuItem = (
        <TouchableOpacity
          onPress={()=> this.goTo('DevicesHomeScreen')}
          >
          <View
          style={{
            flexDirection: 'row',
            borderColor: '#7E7977',
            borderStyle: 'solid',
            borderBottomWidth: 1,
            paddingBottom: 18,
            paddingTop: 18,
          }}>
            <Icon
              style={{
                marginLeft: 3
              }}
              name="tachometer"
              size={16}
              color="#d8d6d5" />
            <Text
              style={{
                color: '#d8d6d5',
                fontFamily: 'OpenSans-Light',
                fontSize: 16,
                marginLeft: 15,
                marginTop: -2
              }}>
              Devices
            </Text>
          </View>
        </TouchableOpacity>
    );

    return (
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: menuLeft,
          backgroundColor: 'rgb(67, 67, 67)',
          width: windowWidth,
          height: windowHeight
        }}>
        <View
          style={{
            backgroundColor: 'transparent',
            marginTop: 30
          }}>
          <TouchableOpacity
            onPress={() => this.close()}>
            <Icon
              style={{
                position: 'absolute',
                right: 10
              }}
              name="close"
              size={24}
              color="#d8d6d5" />
          </TouchableOpacity>
          {avatarElement}
          {displayNameElement}
          <View
            style={{margin: 20}}>
            {feedMenuItem}
            {devicesMenuItem}
            {syncMenuItem}
          </View>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'flex-end'
          }}>
          <TouchableOpacity
            onPress={()=> this.signOut()}
            style={{
              flexDirection: 'row',
              margin: 20
            }}>
            <Icon
              style={{
                marginRight: 10
              }}
              name="sign-out"
              size={16}
              color="#d8d6d5" />
            <Text
              style={{
                color: '#d8d6d5'
              }}>
              SIGN OUT
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }
}

module.exports = MenuScreen;
