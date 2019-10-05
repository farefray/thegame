/**
 * Used for react cosmos, in order to include backend files from directories of backend
 * Also used for frontend to customize webpack config and use 'rsuite'
 */
const { override, addLessLoader, removeModuleScopePlugin } = require('customize-cra');

const rewiredMap = () => config => {
  config.devtool = config.mode === 'development' ? 'cheap-module-source-map' : false;
  return config;
};

const config = override(
  removeModuleScopePlugin(),
  addLessLoader({
    modifyVars: { 
    },
    javascriptEnabled: true // required for rsuite
  }),
  rewiredMap()
);

module.exports = config;