import _ from 'lodash';
import classNames from 'classnames';

export const globalKey = 'rs-';
export const getClassNamePrefix = () => {
  return globalKey;
};

export const defaultClassPrefix = (name) => `${getClassNamePrefix()}${name}`;

/**
 *
 *
 * @export
 * @param {string} pre
 * @param {(string | string[])} className
 * @param {Boolean} modifier
 * @returns {string}
 */
export function prefix(pre, className, modifier = false) {
  if (!pre || !className) {
    return '';
  }

  if (_.isArray(className)) {
    return classNames(className.filter(name => !!name).map(name => `${pre}-${name}`));
  }

  return `${pre}${modifier ? '__' : '-'}${className}`;
}

export default _.curry(prefix);
