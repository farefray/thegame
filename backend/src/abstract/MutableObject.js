/**
 * @description Data structure which has helper functionality modifying its own parts
 * @returns {MutableObject}
 */
function MutableObject () {
  return this;
}

/**
 * @description Simple getter for a field
 */
MutableObject.prototype.get = function(field) {
  return this[field];
};

/**
 * @description Simple setter for a field
 */
MutableObject.prototype.set = function(field, value) {
  this[field] = value;
};

/**
 * @description Simple getter for a field
 */
MutableObject.prototype.setIn = function(path, value) {
  let _this = this;
  for (let i = 0; i < path.length; i++) {
    if (_this[path[i]] === undefined) {
      _this[path[i]] = {};
    }

    if (i === path.length - 1) {
      _this[path[i]] = value;
    } else {
      _this = _this[path[i]];
    }
  }
};

MutableObject.prototype.delete = function(field) {
  if (this.get(field)) {
    delete this[field];
  }
};


/**
 * @description Returns value any-depth value from current instance
 * var test = {1: {value: {res: 'test}}}
 * test.getIn([1, 'value', 'res']) === 'test' // true
 * @param {Array[any]} path
 * @returns {Any}
 */
MutableObject.prototype.getIn = function (path) {
  let _this = this;
  let returnValue;
  for (let i = 0; i < path.length; i++) {
    if (_this[path[i]] === undefined) {
      return returnValue;
    }

    if (i !== path.length - 1) {
      _this = _this[path[i]];
    } else {
      returnValue = _this[path[i]];
    }
  }

  return returnValue;
};

/**
 * @description sets any-depth value into current instance
 * var test = new MutableObject()
 * test.setIn([1, 'value', 'res'], 'test')
 * test === {1: {value: {res: 'test}}}
 * @param {Array[]} path
 */
MutableObject.prototype.setIn = function(path, value) {
  let _this = this;
  for (let i = 0; i < path.length; i++) {
    if (!_this[path[i]]) {
      _this[path[i]] = {};
    }

    if (i === path.length - 1) {
      _this[path[i]] = value;
    } else {
      _this = _this[path[i]];
    }
  }
};

/**
 * @description removs any-depth value from current instance
 * var test = new MutableObject()
 * test.setIn([1, 'value', 'res'], 'test')
 * test.deleteIn([1, 'value', res'])
 * test === {1: {value: {}}}
 * @param {Array[]} path
 */
MutableObject.prototype.deleteIn = function(path) {
  let _this = this;
  for (let i = 0; i < path.length; i++) {
    if (_this[path[i]] === undefined) {
      _this[path[i]] = {};
    }

    if (i === path.length - 1) {
      delete _this[path[i]];
    } else {
      _this = _this[path[i]];
    }
  }
};

export default MutableObject;
