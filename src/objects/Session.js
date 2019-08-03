const uuidv1 = require('uuid/v1');

function Session() {
  this.ID = uuidv1();
  this.state = {};
  this.customers = [];

  return this;
}

Session.prototype.get = function (field) {
  return this[field] || null;
};

Session.prototype.set = function (field, value) {
  this[field] = value;
};

module.exports = Session;
