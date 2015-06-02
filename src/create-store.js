'use strict';

import getClassStatics from 'get-class-statics';
import StoreUtil, { alt } from './';

function createStore(StoreModel, iden, ...opts) {
  var Item = StoreUtil.Item;
  var Collection = StoreUtil.Collection;
  var Query = StoreUtil.Query;

  var items = new Object;
  var collections = new Object;

  class BaseStore {

    static get items() {
      return items;
    }

    static addItem(item) {
      items[item.id] = item;
    }

    static addOrUpdateItems(...items) {
      items = (items.length === 1 && items[0] instanceof Array) ? items[0] : items;

      items.forEach((item) => {
        var id = item.id;
        var existingItem = this.getItem(id);

        if (typeof existingItem === 'undefined') {
          this.addItem(item);

        } else {
          this.updateItem(item);
        }
      });
    }

    static getItem(id) {
      return items[id];
    }

    static updateItem(newItem) {
      var item = this.getItem(newItem.id);

      if (!item) {
        throw new Error(iden + '\'s item with id "' + newItem.id + '" not found.');
      }

      item.update(newItem)
        .commitChange();
    }

    static get collections() {
      return collections;
    }

    static addCollection(collection) {
      collections[collection.id] = collection;
      collection.injectItems();
    }

    static getCollection(id) {
      return collections[id];
    }

    static commitChange(payload) {
      if (payload instanceof Item) {
        let item = payload;
        items[item.id] = item;
        this.emitChange();
      }

      if (payload instanceof Collection) {
        let collection = payload;
        collections[collection.id] = collection;
        this.emitChange();
      }
    }

    static bindCollection(id, methodName, ...args) {
      var retrieve = this[methodName].bind(this, ...args);
      var store = this;

      return { type: Collection, id, store, retrieve };
    }

    static bindItem(id, methodName, ...args) {
      var retrieve = this[methodName].bind(this, ...args);
      var store = this;

      return { type: Item, id, store, retrieve };
    }

    static reuseItem(id, requiredProps) {
      return new Query()
        .requireItem(id, requiredProps)
        .from(this);
    }

    onUpdateItem(payload) {
      this.getInstance().updateItem(payload);

      // Prevent double emitChange
      return false;
    }
  }

  Object.keys(getClassStatics(BaseStore)).forEach((name) => {
    var method = BaseStore[name];

    Object.defineProperty(StoreModel, name, {
      value: method,
      writeable: true,
      configurable: true
    });
  });

  Object.keys(getClassStatics(BaseStore.prototype)).forEach((name) => {

    if (name === 'constructor') {
      return;
    }

    var method = BaseStore.prototype[name];

    Object.defineProperty(StoreModel.prototype, name, {
      value: method,
      writeable: true,
      configurable: true
    });
  });

  iden = iden || StoreModel.displayName || StoreModel.name;

  return alt.createStore(...[ StoreModel, iden ].concat(opts));
};

export default createStore;
