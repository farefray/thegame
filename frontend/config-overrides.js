/**
 * Used for react cosmos, in order to include backend files from directories of backend
 * Also used for frontend to customize webpack config and use 'rsuite'
 */
const { override, addLessLoader, removeModuleScopePlugin, addWebpackAlias } = require('customize-cra');
const path = require('path');

const rewiredMap = () => config => {
  config.devtool = config.mode === 'development' ? 'cheap-module-source-map' : false;
  return config;
};

const config = override(
  removeModuleScopePlugin(),
  addLessLoader({
    modifyVars: require('./src/UI/ui-overrides.js'),
    async: true,
    env: "development",
    useFileCache: true,
    sourceMap: {},
    javascriptEnabled: true // required for rsuite
  }),
  rewiredMap(),

  addWebpackAlias({
    backend: path.resolve(__dirname, "..", "backend"),
    components: path.resolve(__dirname, "src", "components"),
    shared: path.resolve(__dirname, "src", "shared"),
    ['@']: path.join(__dirname, "src")
  }),
);

module.exports = config;