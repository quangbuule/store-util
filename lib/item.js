'use strict';

var _ = require('lodash');

function Item(props) {
  props = _.assign({
    data: {},
    idAttribute: props.Store.idAttribute,
    isRetrieving: false,
    isRetrieved: false,
    isExpired: true,
    retrieveFn: _.noop,
    TTL: Infinity
  }, props, Item.methods);

  _.assign(this, props);
};

Item.methods = {};

Item.prototype.get = function () {
  var payload = _.assign({}, this.data);
  payload = _.assign(payload, _.pick(this, 'id', 'isRetrieving', 'isRetrieved', 'Store'));
  return payload;
};

Item.prototype.update = function (item) {
  var data = item.data;
  var extendData = Item.methods.extendData || _.assign.bind(_);

  _.assign(this, _.omit(item, 'data'));
  _.assign(this.data, data);
};

Item.prototype.changeId = function (newId) {
  var oldId = this.id;

  _.assign(this, { id: newId });
  this.Store._itemIdDidChange(oldId, newId);
};

Item.prototype.retrieve = function () {
  if (this.isRetrieving) {
    return;
  }

  if (this.isExpired) {
    this.isExpired = false;
    this.isRetrieving = true;
    this.isRetrieved = false;

    this.retrieveFn()
      .then(this.dataDidRetrieve.bind(this));
  }

  this.trigger();
};

Item.prototype.dataDidRetrieve = function (res) {
  this.isRetrieved = true;
  this.isRetrieving = false;
  this.update(_.pick(res, 'data'));

  if (res.data && res.data[this.idAttribute]) {
    this.changeId(res.data[this.idAttribute]);
  }

  this.trigger();
};

Item.prototype.trigger = function () {
  this.Store.trigger(this.get());
};

Item.prototype.twist = function () {
  if (this.TTL && isFinite(this.TTL)) {
    setTimeout(function () {
      this.isExpired = true;
    }.bind(this), this.TTL);
  }
};

module.exports = Item;
