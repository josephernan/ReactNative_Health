'use strict';

import React, {
  Animated,
  Component,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {avatarChild, emailChild} from '../utils/firebase';

let _ = require('lodash');
let styleGuide = require('../style-guide');
import {local, state, remote} from '../storage';
let subScreenOpacity = new Animated.Value(0);
let slidingBarLeft = new Animated.Value(0);
let ErrorMessage = require('../components/error-message');

class LoginScreen extends Component {
  state = {
    email: '',
    emailError: '',
    password: '',
    passwordError: ''
  };

  componentWillMount() {
    // make sure the toggler position gets fixed on orientation change
    this.props.app.on('orientation', () => {
      let subScreen = state('login-sub-screen');
      if (subScreen === 'sign in') {
        return this.modeSwitchSignIn();
      }

      this.modeSwitchSignUp();
    });
  }

  componentDidMount() {
    // when the component loads make sign in fade in
    Animated.timing(subScreenOpacity, {toValue: 1}).start();
  }

  /**
   * Fade in the sign-in or sign-up sub-screen
   */
  fadeInSubScreen() {
    // fade in the sign-in or sign-up sub-screen
    subScreenOpacity.setValue(0);
    Animated.timing(subScreenOpacity, {toValue: 1}).start();
  }

  /**
   * Switch to the sign-in form
   */
  modeSwitchSignIn() {
    // goto sign in screen
    // animate sliding bar to the left
    state('login-sub-screen', 'sign in');
    Animated.spring(slidingBarLeft, {toValue: 0}).start();
  }

  /**
   * Switch to the sign-up form
   */
  modeSwitchSignUp() {
    // goto sign up screen
    // animate sliding bar to the right
    let windowWidth = state('window-width');
    let halfWindowWidth = Math.floor(windowWidth / 2);

    state('login-sub-screen', 'sign up');
    Animated.spring(slidingBarLeft, {toValue: halfWindowWidth}).start();
  }

  validateEmail() {
    let valid = true;
    let email = this.state.email;
    let error = '';

    if (
      email.length < 5 ||
        email.length > 254 ||
        email.indexOf('@') === -1 ||
        email.indexOf('.') === -1
    ) {
      error = 'Please provide a valid email.';
    }

    if (error.length > 0) {
      valid = false;
      this.setState({emailError: error});
    }

    return valid;
  }

  validatePassword() {
    let valid = true;
    let password = this.state.password;
    let error = '';

    if (password.length < 6 || password.length > 20) {
      error = 'Please provide a password longer than 6 characters and less than 30.';
    }

    if (error.length > 0) {
      valid = false;
      this.setState({passwordError: error});
    }

    return valid;
  }

  saveUserData(email, authData) {
    const avatarUrl = _.get(authData, 'password.profileImageURL');
    if (avatarUrl) {
      avatarChild().set(avatarUrl);
    }
    emailChild().set(email);
  }

  userSignIn() {
    let email = this.state.email;
    let password = this.state.password;

    if (this.validateEmail() === false) {
      return;
    }

    if (this.validatePassword() === false) {
      return;
    }

    remote.authWithPassword({email, password}, (err, authData) => {

      if (err !== undefined && err !== null) {
        return this.setState({emailError: err.message});
      }

      this.saveUserData(email, authData);

      state('screen', 'FeedScreen');
    });
  }

  userSignUp() {
    let email = this.state.email;
    let password = this.state.password;

    if (this.validateEmail() === false) {
      return;
    }

    if (this.validatePassword() === false) {
      return;
    }

    remote.createUser({email, password}, (err, userData) => {

      if (err !== undefined && err !== null) {
        return this.setState({emailError: err.message});
      }
      this.saveUserData(email, authData);
      state('screen', 'FeedScreen');
    });
  }

  btnPress() {
    let subScreen = state('login-sub-screen');

    this.setState({
      emailError: '',
      passwordError: ''
    });

    if (subScreen === 'sign in') {
      return this.userSignIn();
    }

    this.userSignUp();
  }

  render() {
    let btnText;
    let subScreen = state('login-sub-screen');
    let windowWidth = state('window-width');
    let halfWindowWidth = Math.floor(windowWidth / 2);
    let slidingBarDynamics = {
      width: halfWindowWidth,
      left: slidingBarLeft
    };
    let logoDynamics = {
      width: halfWindowWidth,
      height: halfWindowWidth
    };
    let signInSelected;
    let signUpSelected;
    let emailError = this.state.emailError;
    let emailErrMsg;
    let passwordError = this.state.passwordError;
    let passwordErrMsg;

    if (subScreen === 'sign in') {
      btnText = 'SIGN IN';
      signInSelected = styles.modeSwitcherButtonTextSelected;
    }

    if (subScreen === 'sign up') {
      btnText = 'REGISTER';
      signUpSelected = styles.modeSwitcherButtonTextSelected;
    }


    if (emailError && emailError.length > 0) {
      emailErrMsg = (
        <ErrorMessage
          onPress={() => this.setState({emailError: ''})}
          message={emailError} />
      );
    }

    if (passwordError && passwordError.length > 0) {
      passwordErrMsg = (
        <ErrorMessage
          onPress={() => this.setState({passwordError: ''})}
          message={passwordError} />
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.modeSwitcherOuter}>
          <TouchableOpacity
            style={[styles.modeSwitcherButton, {width: halfWindowWidth}]}
            onPress={() => this.modeSwitchSignIn()}>
            <Text style={[styles.modeSwitcherButtonText, signInSelected]}>
              SIGN IN
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeSwitcherButton, {width: halfWindowWidth}]}
            onPress={() => this.modeSwitchSignUp()}>
            <Text style={[styles.modeSwitcherButtonText, signUpSelected]}>
              SIGN UP
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.slidingBarOuter}>
          <Animated.View style={[styles.slidingBarInner, slidingBarDynamics]}>
            <View style={styles.slidingBarInner2} />
          </Animated.View>
        </View>
        <Animated.View style={{opacity: subScreenOpacity}}>
          <View style={styles.signInForm}>
            <Image
              style={[styles.opalLogo, logoDynamics]}
              source={require('./opal_identity_300_vertical_flat.png')} />
            {emailErrMsg}
            <TextInput
              key="txtEmail"
              style={styles.textbox}
              autoCapitalize={'none'}
              autoCorrect={false}
              maxLength={254}
              placeholder="Email"
              placeholderTextColor={styleGuide.grays.dark}
              onChangeText={(email) => this.setState({email})} />
            {passwordErrMsg}
            <TextInput
              key="txtPassword"
              style={styles.textbox}
              autoCapitalize={'none'}
              autoCorrect={false}
              maxLength={50}
              placeholder="Password"
              placeholderTextColor={styleGuide.grays.dark}
              secureTextEntry={true}
              onChangeText={(password) => this.setState({password})} />
          </View>
          <TouchableOpacity
            style={styles.btnOuter}
            onPress={() => this.btnPress()}>
            <Text style={styles.btnInner}>{btnText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleGuide.grays.light
  },
  textbox: {
    backgroundColor: styleGuide.grays.light,
    borderRadius: 3,
    fontFamily: 'OpenSans-Light',
    marginRight: 10,
    marginBottom: 10,
    marginLeft: 10,
    padding: 12,
    height: 40,
    fontSize: 14
  },
  modeSwitcherOuter: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row'
  },
  modeSwitcherButton: {
    flexDirection: 'column'
  },
  modeSwitcherButtonText: {
    alignSelf: 'center',
    color: styleGuide.grays.medium,
    fontFamily: 'Montserrat',
    margin: 15
  },
  modeSwitcherButtonTextSelected: {
    color: styleGuide.hues.green
  },
  slidingBarOuter: {
    backgroundColor: '#FFFFFF',
    height: 4
  },
  slidingBarInner: {
    height: 4
  },
  slidingBarInner2: {
    backgroundColor: styleGuide.hues.green,
    height: 4
  },
  signInForm: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    margin: 10,
    padding: 10
  },
  btnOuter: {
    flex: 1,
    backgroundColor: styleGuide.hues.green,
    borderRadius: 4,
    marginRight: 10,
    marginBottom: 30,
    marginLeft: 10,
    padding: 13
  },
  btnInner: {
    alignSelf: 'center',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold'
  },
  opalLogo: {
    margin: 10
  }
});

module.exports = LoginScreen;
