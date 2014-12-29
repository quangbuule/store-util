'use strict';

var _ = require('lodash');

var StoreUtil = require('./');

function Collection(props) {
  var self = this;

  props = _.assign({
    _items: [],
    _previousResponse: {},
    idAttribute: props.Store.idAttribute,
    isRetrieving: false,
    isRetrieved: false,
    isExpired: true,
    retrieveFn: _.noop,
    isFull: true,
    TTL: Infinity,
    limit: Infinity
  }, props);

  _.assign(Collection.prototype, Collection.methods);

  _.assign(this, props);
};

Collection.methods = {};

Collection.prototype.get = function () {
  var payload = this._items.map(function (item) {
    return this.Store.getItem(item.id).get();
  }.bind(this));

  _.assign(payload, _.pick(this, 'id', 'isRetrieving', 'isRetrieved', 'Store', 'isFull'));

  payload.retrieveMore = this.retrieveMore.bind(this);

  return payload;
};

Collection.prototype.update = function (collection) {
  var _items = collection._items;

  _.assign(this, _.omit(collection, '_items'));
};

Collection.prototype.append = function (items) {
  var items = _.flatten(arguments);
  var Store = this.Store;

  this._items = _.union(
    this._items,
    _.map(items, function (item) {
      return _.pick(item, 'id');
    }),
    'id'
  );

  Store.addOrUpdateItems(items);
};

Collection.prototype.prepend = function (items) {
  var items = _.flatten(arguments);
  var Store = this.Store;

  this._items = _.union(
    _.map(items, function (item) {
      console.log(item);
      return _.pick(item, 'id');
    }),
    this._items,
    'id'
  );

  Store.addOrUpdateItems(items);
};

Collection.prototype.retrieve = function () {
  if (this.isRetrieving) {
    return;
  }

  if (this.isExpired) {
    // TODO: Consider clear or not
    this.clear();
    this.isExpired = false;
    this.isRetrieving = true;
    this.isRetrieved = false;

    this.retrieveFn()
      .then(this.dataDidRetrieve.bind(this));
  }

  this.trigger();
};

Collection.prototype.retrieveMore = function () {
  if (this.isRetrieving) {
    return;
  }

  var promise = this._retrieveMore();

  if (!promise || !_.isFunction(promise.then)) {
    return;
  }

  this.isFull = false;
  this.isRetrieving = true;
  promise.then(this.dataDidRetrieve.bind(this));

  this.trigger();
};

Collection.prototype.dataDidRetrieve = function (res) {
  this.isRetrieved = true;
  this.isRetrieving = false;

  var Store = this.Store;
  var items = this._parseRes(res).map(function (data) {
    return new StoreUtil.Item({
      id: data[this.idAttribute],
      data: data,
      Store: Store
    });
  }.bind(this));

  this._previousResponse = res;
  this.isFull = this._isFull(this);

  this.append(items);
  this.trigger();
};

Collection.prototype._isFull = function () {
  return Boolean(this._previousResponse && this._previousResponse.pagination &&
    this._previousResponse.pagination.nextUrl);
};

Collection.prototype._parseRes = function (res) {
  return res.data;
};

Collection.prototype._retrieveMore = function () {
  return { then: _.noop };
};

Collection.prototype.trigger = function () {
  this.Store.trigger(this.get());
};

Collection.prototype.twist = function () {
  if (this.TTL && isFinite(this.TTL)) {
    setTimeout(function () {
      this.isExpired = true;
    }.bind(this), this.TTL);
  }
};

Collection.prototype.clear = function () {
  this._items = [];
};


module.exports = Collection;
