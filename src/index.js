'use strict';

import React, {
  AppRegistry,
  Dimensions,
  Component,
  Navigator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import _ from 'lodash';
import {EventEmitter} from 'events';
import storage, {local, state, remote} from './storage';
import {fromCallback} from './utils/functions';
let styleGuide = require('./style-guide');
let routes = require('./routes');
let Orientation = require('react-native-orientation');
let MenuScreen = require('./screens/menu-screen');
let Icon = require('react-native-vector-icons/FontAwesome');
let app = new EventEmitter();
let navInstance;
let navigationBarHeight = Navigator.NavigationBar.Styles.General.TotalNavHeight;

// give storage a reference to the app instance
storage.attach({app});

function orientationChange(orientation) {
  let win = Dimensions.get('window');
  let width = win.width;
  let height = win.height;
  // in landscape the width is actually the height
  let windowWidth = (orientation === 'LANDSCAPE') ? height : width;
  let windowHeight = (orientation === 'LANDSCAPE') ? width : height;
  // possible values can be: LANDSCAPE, PORTRAIT, UNKNOWN, PORTRAITUPSIDEDOWN
  state('orientation', orientation, false);
  state('window-width', windowWidth, false);
  state('window-height', windowHeight);
  app.emit('orientation', orientation);
}

function orientationChangeErrData(err, orientation) {
  if (err !== undefined && err !== null) {
    console.error('error getting orientation');
    return console.error(err);
  }
  orientationChange(orientation);
}

// wait for the device to flip around
Orientation.addOrientationListener(orientationChange);

// find out which way it is at now
Orientation.getOrientation(orientationChangeErrData);

let routeMapper = {
  LeftButton: function (route, navigator, index, navState) {
    return;
  },
  RightButton: function (route, navigator, index, navState) {
    let userEmail = state('user-email');

    if (userEmail === undefined || userEmail === null) {
      // if the user is not logged in don't show the hamburger menu
      return;
    }

    return (
      <TouchableOpacity
        style={{
          margin: 14
        }}
        onPress={() => app.emit('toggle-menu')}>
      <Icon
        name="bars"
        size={20}
        color={styleGuide.grays.medium} />
      </TouchableOpacity>
    );
  },
  Title: function (route, navigator, index, navState) {
    let titleStyle = styles.navTitle;
    let title = route.title;

    if (title === undefined) {
      title = 'OPAL';
    }

    return (
      <View style={styles.navButtonContainer}>
        <Text style={titleStyle}>{title}</Text>
      </View>
    );
  }
};

function navigationJump() {
  let screen = state('screen');
  let route = routes[screen];
  navInstance.replace(route);
}

// each scene will get the route information and navigator as props
function renderScene(route, navigator) {
  let width = state('window-width');
  let height = state('window-height');
  let SceneComponent = route.component;

  if (navInstance === undefined) {
    // this needs to run once so we can get the navigator instance
    // and create a handler for the route change
    navInstance = navigator;
    app.on('state', navigationJump);
  }

  routes.currentRoute = route;

  return (
    <View
      style={{
        flex: 1,
        marginTop: navigationBarHeight
      }}>
      <SceneComponent app={app} />
    </View>
  );
}

// the main `Opal` component is simply a wrapper for the screens
class Opal extends Component {
  constructor(...args) {
    super(...args);

    state('AppLoaded', false);
  }
  /**
   * before the component mounts we need to watch for state changes
   */
  componentWillMount() {

    // tell react it can render when the state changes
    app.on('state', () => this.forceUpdate());
  }

  componentDidMount() {
    fromCallback(cb=> local('firebaseAuth', cb))
    .then(result=> {
      if (result && result.expires * 1000 > Date.now()) {
        return fromCallback(cb=> remote.authWithCustomToken(result.token, cb))
        .then(remoteResult=> {
          if (remoteResult) {
            state('screen', 'FeedScreen');
          }
        });
      }
    })
    .catch(error=> console.log('load auth error', error, error.stack))
    .then(()=> state('AppLoaded', true))
    .catch(error=> console.log('app boot error', error, error.stack));

    remote.onAuth(saveAuth);
    this._removeOnAuth = removeOnAuth;
    function saveAuth(auth) {
      const saveData = _.pick(auth, 'provider', 'token', 'expires');
      local('firebaseAuth', saveData);
      if(state('AppLoaded') && !auth) {
        storage.clearUserStorage();
      }
    }
    function removeOnAuth() {
      remote.offAuth(saveAuth);
    }
  }

  componentWillUnmount() {
    this._removeOnAuth();
  }

  render() {
    let screen = state('screen');
    let initialRoute = routes[screen];
    let navigationBar;

    navigationBar = (
      <Navigator.NavigationBar
        style={styles.navBar}
        routeMapper={routeMapper} />
    );

    const child = state('AppLoaded') ? [
      <Navigator
        key="navigator"
        style={styles.navigator}
        navigationBar={navigationBar}
        initialRoute={initialRoute}
        renderScene={renderScene} />,
      <MenuScreen app={app} key="app" />,
    ] : <Text>Loading...</Text>;

    return (
      <View
        style={{flex: 1}}>
        {child}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  navigator: {
    flex: 1
  },
  navigatorSrollView: {
    marginTop: navigationBarHeight
  },
  navBar: {
    flex: 1,
    backgroundColor: '#D8D6D5'
  },
  navButtonContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  navTitle: {
    color: styleGuide.grays.dark,
    fontFamily: 'Montserrat-Light'
  }
});

AppRegistry.registerComponent('Opal', () => Opal);
