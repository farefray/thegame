/**
 * Used for react cosmos, in order to include backend files from directories of backend
 * Also used for frontend to customize webpack config and use 'rsuite'
 */
const { override, addLessLoader, removeModuleScopePlugin, addWebpackAlias, getBabelLoader, addWebpackModuleRule, adjustStyleLoaders } = require('customize-cra');
const { overridePassedProcessEnv } = require("cra-define-override");
const { addReactRefresh } = require("customize-cra-react-refresh"); // todo test if thats works 
const path = require('path');

// Build performance measuring. If not running with MEASURE var, just doing nothing
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin({ disable: !process.env.MEASURE });

// Babel enchanting with some imba hacks :(
const enchantBabelForTypescript = () => config => {
  // create-react-app defines two babel configurations, one for js files found in src/ and another for any js files found outside that directory
  // Since we are importing backend files for cosmos, we need to provide same config for external configuration, as .ts used there
  const mainConfig = getBabelLoader(config);
  const outsideBabelOptions = getBabelLoader(config, true).options;
  if (!outsideBabelOptions.plugins) {
    outsideBabelOptions.plugins = [];
  }

  // outsideBabelOptions.plugins.push(["@babel/plugin-proposal-class-properties", { "loose": true }]);
  outsideBabelOptions.plugins.push('@babel/proposal-class-properties');
  outsideBabelOptions.plugins.push('@babel/proposal-object-rest-spread');
  outsideBabelOptions.plugins.push('@babel/proposal-optional-chaining');
  outsideBabelOptions.plugins.push('@babel/proposal-nullish-coalescing-operator');
  outsideBabelOptions.presets.push('@babel/typescript');
  getBabelLoader(config, true).test = mainConfig.test;
  return config;
};

const isDev = process.env.NODE_ENV !== 'production';

const webpackConfig = override(
  overridePassedProcessEnv(["REACT_APP_DEBUGMODE", "REACT_APP_STEPBYSTEP"]),
  process.env.APP_COSMOS ? (config) => config : addReactRefresh({ disableRefreshCheck: true }), // react-refresh for yarn dev, but not for cosmos
  (config) => {
    config.devtool = 'eval-cheap-module-source-map';
    return config;
  },
  removeModuleScopePlugin(),
  addWebpackModuleRule({ test: /\.(gif|jpe?g|png|svg)$/, use: [{ loader: '@lesechos/image-size-loader', options: {
    name: '[name].[contenthash].[ext]',
    outputPath: 'static/assets/',
    postTransformPublicPath: (p) => `__webpack_public_path__ + ${p}`,
  }}]}),
  addLessLoader({
    lessOptions: {
      modifyVars: require('./src/UI/ui-overrides.js'),
      env: process.env.NODE_ENV,
      useFileCache: true, // enabled 02.06.20 to speedup compilation. Seems makes no isses
      sourceMap: isDev,
      javascriptEnabled: true, // required for rsuite
      relativeUrls: false
    },
  }),
  adjustStyleLoaders(({ use: [ , css, postcss, resolve, processor ] }) => {
    css.options.sourceMap = isDev;         // css-loader
    postcss.options.sourceMap = isDev;     // postcss-loader
    // when enable pre-processor,
    // resolve-url-loader will be enabled too
    if (resolve) {
      resolve.options.sourceMap = isDev;   // resolve-url-loader
    }
    // pre-processor
    if (processor && processor.loader.includes('sass-loader')) {
      processor.options.sourceMap = isDev; // sass-loader
    }
  }),
  isDev ? enchantBabelForTypescript() : (config) => config,
  addWebpackAlias({
    backend: path.resolve(__dirname, '..', 'backend'),
    components: path.resolve(__dirname, 'src', 'components'),
    shared: path.resolve(__dirname, 'src', 'shared'),
    ['@']: path.join(__dirname, 'src')
  })
);

module.exports = smp.wrap(webpackConfig);
