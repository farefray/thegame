import _ from 'lodash';
import classNames from 'classnames';

const getGlobal = new Function('return this;');
const globals = getGlobal();

export const globalKey = 'rs-';
export const getClassNamePrefix = () => {
  if (globals && typeof globals.__RSUITE_CLASSNAME_PREFIX__ !== 'undefined') {
    return globals.__RSUITE_CLASSNAME_PREFIX__;
  }
  return globalKey;
};

export const defaultClassPrefix = (name) => `${getClassNamePrefix()}${name}`;

/**
 *
 *
 * @export
 * @param {string} pre
 * @param {(string | string[])} className
 * @returns {string}
 */
export function prefix(pre, className) {
  if (!pre || !className) {
    return '';
  }

  if (_.isArray(className)) {
    return classNames(className.filter(name => !!name).map(name => `${pre}-${name}`));
  }

  return `${pre}-${className}`;
}

export default _.curry(prefix);
