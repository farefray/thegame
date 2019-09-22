const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
/**
 * Used for react cosmos, in order to include backend files from directories of backend
 */
module.exports = function override(config, env) {
  config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));

  return config;
};
