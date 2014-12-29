'use strict';

var _ = require('lodash');
var StoreUtil = require('./');

function Handler(Store, props) {
  props = _.assign({
    id: null,
    Store: Store,
    Constructor: StoreUtil.Item,
    retrieveFn: _.noop,
    TTL: Infinity,
    limit: Infinity,
    _instance: null
  }, props);

  _.assign(this, props);
}

Handler.prototype.initialize = function () {
  var Store = this.Store;
  var add, get;

  switch(this.Constructor) {
    case StoreUtil.Item:
      add = Store.addItem.bind(Store);
      get = Store.getItem.bind(Store);
      break;

    case StoreUtil.Collection:
      add = Store.addCollection.bind(Store);
      get = Store.getCollection.bind(Store);
      break;
  }

  var existedInstance = get(this.id);

  if (!existedInstance) {
    add(new this.Constructor({
      id: this.id,
      Store: this.Store,
      retrieveFn: this.retrieveFn,
      TTL: this.TTL,
      limit: this.limit
    }));

  } else {
    existedInstance.update({
      retrieveFn: this.retrieveFn,
      TTL: this.TTL,
      limit: this.limit
    });

    this.id = existedInstance.id;
  }

  this._instance = get(this.id);
};

Handler.prototype.retrieve = function () {
  return this._instance.retrieve();
};

Handler.prototype.listen = function (callback) {
  var Store = this.Store;

  return Store.listen(function (payload) {
    if (payload.id === this._instance.id) {
      callback(payload);
    }
  }.bind(this));
};

module.exports = Handler;
