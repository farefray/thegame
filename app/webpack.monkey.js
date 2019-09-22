/**
 * Mutation for react-scripts webpack configuration
 */

const Visualizer = require("webpack-visualizer-plugin");

module.exports = function(webpackConfig, isDevelopment) {
  if (!isDevelopment) {
    webpackConfig.plugins.push(new Visualizer());
  } else {
    // add development webpack plugins here
  }
};