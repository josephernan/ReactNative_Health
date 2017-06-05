'use strict';

/**
 * Styles that relate to the company branding
 * It's also documented in ../docs/style-guide.md
 */

let styleGuide = {};

const grays = {
  dark: '#434343',
  medium: '#95918F',
  light: '#E8E7E6'
};

styleGuide.grays = grays;

const hues = {
  green: '#66BB6A',
  orange: '#FCB316',
  pink: '#EC407A',
  purple: '#775CA7',
  blue: '#56C0EE',
  chartreuse: '#CDDC37'
};

styleGuide.hues = hues;

const typography = {
  primary: 'Futura Medium',
  utility: 'Gotham Medium',
  body: 'Gotham Narrow Book'
};

styleGuide.typography = typography;

module.exports = styleGuide;
