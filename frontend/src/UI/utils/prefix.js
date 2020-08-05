import classNames from 'classnames';

export const globalKey = 'rs-';
export const getClassNamePrefix = () => {
  return globalKey;
};

export const defaultClassPrefix = (name) => `${getClassNamePrefix()}${name}`;

const _ = '_';
function curry (targetfn, ...preset) {
  var numOfArgs = targetfn.length;
  var nextPos = 0; //the index of next valid input location, either a '_', or the end of preset.

  //check if there is enough valid arguments
  if (preset.filter(arg=> arg !== _).length === numOfArgs) {
    return targetfn.apply(null, preset);
  } else {
    //return the 'helper' function
    return function (...added) {
      //loop through and put added arguments to the preset arguments
      while(added.length > 0) {
        var a = added.shift();
        //get next placeholder position, either '_' or the end of preset
        while (preset[nextPos] !== _ && nextPos < preset.length) {
          nextPos++
        }
        //update the preset
        preset[nextPos] = a;
        nextPos++;
      }
      //bind with the updated preset
      return curry.call(null, targetfn, ...preset);
    }
  }
}
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

  if (Array.isArray(className)) {
    return classNames(className.filter(name => !!name).map(name => `${pre}-${name}`));
  }

  return `${pre}${modifier ? '__' : '-'}${className}`;
}

export default curry(prefix);
