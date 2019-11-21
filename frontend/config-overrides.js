/**
 * Used for react cosmos, in order to include backend files from directories of backend
 * Also used for frontend to customize webpack config and use 'rsuite'
 */
const { override, addLessLoader, removeModuleScopePlugin, addWebpackAlias, getBabelLoader, addWebpackModuleRule } = require('customize-cra');
const path = require('path');

const rewiredMap = () => config => {
  config.devtool = config.mode === 'development' ? 'cheap-module-source-map' : false;
  return config;
};

// Babel enchanting with some imba hacks :(
const enchantBabelForTypescript = () => config => {
  // create-react-app defines two babel configurations, one for js files found in src/ and another for any js files found outside that directory
  // Since we are importing backend files for cosmos, we need to provide same config for external configuration, as .ts used there
  const mainConfig = getBabelLoader(config);
  const outsideBabelOptions = getBabelLoader(config, true).options;
  if (!outsideBabelOptions.plugins) {
    outsideBabelOptions.plugins = [];
  }

  outsideBabelOptions.plugins.push('@babel/proposal-class-properties');
  outsideBabelOptions.plugins.push('@babel/proposal-object-rest-spread');
  outsideBabelOptions.plugins.push('@babel/proposal-optional-chaining');
  outsideBabelOptions.plugins.push('@babel/proposal-nullish-coalescing-operator');
  outsideBabelOptions.presets.push('@babel/typescript');
  getBabelLoader(config, true).test = mainConfig.test;
  return config;
};

const config = override(
  removeModuleScopePlugin(),
  addWebpackModuleRule({ test: /\.(gif|jpe?g|png|svg)$/, use: '@lesechos/image-size-loader' }),
  addLessLoader({
    modifyVars: require('./src/UI/ui-overrides.js'),
    async: true,
    env: 'development',
    useFileCache: true,
    sourceMap: {},
    javascriptEnabled: true // required for rsuite
  }),
  rewiredMap(),
  enchantBabelForTypescript(), // required only for cosmos. TODO: Exclude it from frontend builds
  addWebpackAlias({
    backend: path.resolve(__dirname, '..', 'backend'),
    components: path.resolve(__dirname, 'src', 'components'),
    shared: path.resolve(__dirname, 'src', 'shared'),
    ['@']: path.join(__dirname, 'src')
  })
);

module.exports = config;
