
The [Getting Started](https://facebook.github.io/react-native/docs/getting-started.html#content) document from Facebook's official page will help if you are totally fresh to React Native development.

### Requirements:

+ node
    * Install via [nvm](https://github.com/creationix/nvm)
    * It will probably work with many versions of node.
    * `nvm install v5.5.0 && nvm alias default v5.5.0 && node -v`
+ Apple Xcode 7.2
    * Other versions might work
    * Download page](https://developer.apple.com/xcode/download/)

React Native uses ES6 and JSX languages through the [Babel](http://babeljs.io/) preprocessor.

### Install dependencies

To get this project up and running we first need to install dependencies.

```sh
npm install

# the Xcode build process requires react-native-cli installed globally
npm install react-native-cli -g

# firebase cli app
npm install firebase-tools -g
```

### Run development scripts

```sh
# eslint code style tool
npm run lint

# eslint for use in development
# it will not report a failure to npm and create npm-debug.log
npm run dev-lint

# jest unit tests
# mocking is currently disabled in package.json/jest/unmockedModulePatterns
npm test

# development watch mode
# run lint, jest, and watch for changes
npm run dev-watch
```

### iOS Simulator

Open the Xcode project from `../ios/Health.xcodeproj` and from Xcode hit the play button.

+ Press `Cmd+R` to reload
+ `Cmd+D` for dev menu
    * This gives the option to debug in Chrome
    * React development tools extension required in Chrome

### Code style

We're deferring to the style that the React Native team uses. These files will help you discover the rules that we're using.

+ [EditorConfig](http://editorconfig.org/)
    * [./react-native/.editorconfig](https://github.com/facebook/react-native/blob/master/.editorconfig)
+ ESLint
    * [./react-native/.eslintrc](https://github.com/facebook/react-native/blob/master/.eslintrc)

### Errors

*Cannot find module 'ErrorUtils'*

+ Edit `node_modules/react-native/jestSupport/env.js`
+ Comment line reading `jest.setMock('ErrorUtils', require('ErrorUtils'));`
+ This is a hack.

### Unit testing `React.Component`
At the time of writing this it doesn't currently work through Jest.
[https://github.com/facebook/react-native/issues/5532](https://github.com/facebook/react-native/issues/5532)
[https://github.com/facebook/react-native/issues/5323](https://github.com/facebook/react-native/issues/5323)
