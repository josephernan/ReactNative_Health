'use strict';

/**
 * Routes
 *
 * route.component is the screen component to show in the navigation frame
 */

let screens = require('./screens');
let routes = {};

routes.HomeScreen = {
  id: 'HomeScreen',
  component: screens.HomeScreen
};

routes.LoginScreen = {
  id: 'LoginScreen',
  component: screens.LoginScreen
};

routes.DevicesHomeScreen = {
  id: 'DevicesHomeScreen',
  component: screens.devices.DevicesHomeScreen
};

routes.FeedScreen = {
  id: 'FeedScreen',
  title: 'Feed',
  component: screens.FeedScreen
};

routes.StepsScreen = {
  id: 'StepsScreen',
  title: 'STEPS',
  component: screens.StepsScreen
};

routes.CaloriesScreen = {
  id: 'CaloriesScreen',
  title: 'Calories',
  component: screens.CaloriesScreen
};

routes.WaterScreen = {
  id: 'WaterScreen',
  title: 'Water',
  component: screens.WaterScreen
};

routes.WeightScreen = {
  id: 'WeightScreen',
  title: 'Weight',
  component: screens.WeightScreen
};

routes.currentRoute = routes.HomeScreen;

module.exports = routes;
