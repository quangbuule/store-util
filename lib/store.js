'use strict';

var _ = require('lodash');
var Reflux = require('reflux');
var StoreUtil = require('./');

function Store(specs) {
  var _init = specs.init;

  _.defaults(specs, { idAttribute: Store.idAttribute || 'id' });

  specs.init = function () {
    var self = this;

    this._data = {};
    this._items = {};
    this._collections = {};

    this.ItemHandler = this._createHandler(StoreUtil.Item);
    this.CollectionHandler = this._createHandler(StoreUtil.Collection);

    if (_.isFunction(this.getInitialData)) {
      this.update(this.getInitialData());
    }

    if (_.isFunction(_init)) {
      _init.call(this);
    }
  };

  _.assign(Reflux.StoreMethods, Store.methods);

  return Reflux.createStore(specs);
};

Store.methods = {};

Reflux.StoreMethods.get = function (id) {
  if (_.isUndefined(id)) {
    return _.clone(this._data);

  } else if (this.getItem(id)) {
    return this.getItem(id).get();

  } else if (this.getCollection(id)) {
    return this.getCollection(id).get();
  }
};

Reflux.StoreMethods.update = function(id, data) {
  if (_.isUndefined(data)) {
    data = id;
    return _.assign(this._data, data);

  } else if (this.getItem(id)) {
    return this.updateItem(id, data);

  } else if (this.getCollection(id)) {
    // TODO: Implement collection update here
  }
};

Reflux.StoreMethods.cache = function (id, data) {
  var existedItem = this.getItem(id);
  if (existedItem) {
    existedItem.update(id, { data: data });

  } else {
    var item = new StoreUtil.Item({
      id: id,
      data: data,
      Store: this
    });

    this.addItem(item);
  }
};

Reflux.StoreMethods.remove = function (id) {
  var isItemRemoved = this.removeItem(id);
  var isCollectionRemoved = this.removeCollection(id);

  console.log(isItemRemoved, isCollectionRemoved);
};

Reflux.StoreMethods.clear = function () {
  this._data = {};
  this._items = {};
  this._collections = {};
};

Reflux.StoreMethods.addItem = function (item) {
  this._items[item.id] = item;
};

Reflux.StoreMethods.getItem = function(id) {
  return this._items[id];
};

Reflux.StoreMethods.addOrUpdateItems = function () {
  var store = this;
  var items = _.compact(_.flatten(arguments));

  items.forEach(function (item) {
    var oldItem = this.getItem(item.id);

    if (oldItem) {
      store.updateItem(oldItem.id, item);

    } else {
      store.addItem(item);
    }
  }.bind(this));
};

Reflux.StoreMethods.updateItem = function (id, item) {
  var theItem = this.getItem(id);
  theItem.update(item);
  this.trigger(theItem.get());
};

Reflux.StoreMethods.removeItem = function (item) {
  if (this._items[item.id]) {
    return delete this._items[item.id];

  } else {
    return false;
  }
};

Reflux.StoreMethods._itemIdDidChange = function (oldId, newId) {
  var theItem = this.getItem(oldId);

  this.addItem(theItem);
};

Reflux.StoreMethods.addCollection = function (collection) {
  this._collections[collection.id] = collection;
};

Reflux.StoreMethods.getCollection = function(id) {
  return this._collections[id];
};

Reflux.StoreMethods.removeCollection = function (id) {
  if (this._collections[id]) {
    return delete this._collections[id];

  } else {
    return false;
  }
};

Reflux.StoreMethods._createHandler = function (Constructor) {
  var self = this;

  return function (id, retrieveFn, props) {
    props = _.assign({
      id: id,
      Constructor: Constructor,
      retrieveFn: retrieveFn
    }, props);

    return new StoreUtil.Handler(self, props);
  };
};

module.exports = Store;
