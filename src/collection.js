'use strict';

import alt from 'alt';
import Immutable, { Seq } from 'immutable';
import { Item } from './';
import Model from './model';

class Collection extends Model {

  constructor(rawData, props) {
    var store = props.store;
    var items = rawData.map((itemRawData) => {
      return new Item(itemRawData, { store });
    });

    props.data = new Seq.Indexed(items).map((item) => store.getItem(item.id) || item);

    return super(props);
  }

  get size() {
    return this._data.size;
  }

  map(...args) {
    return this._setData(this._data.map(...args));
  }

  concat(...args) {
    return this._setData(this._data.concat(...args));
  }

  injectItems() {
    this.store.addOrUpdateItems(this._data.toArray());
    return this._setData(this._data.map(item => this.store.getItem(item.id)));
  }

  _dataDidRetrieve() {
    var rawData = this._parse();
    var items = rawData.map((itemRawData) => {
      return new Item(itemRawData, {
        store: this.store
      });
    });

    this.store.addOrUpdateItems(items);
    this.concat(items)
      .commitChange();
  }
}

Collection.idAttribute = 'id';

Collection.parse = function () {
  return this.response.data;
}

Collection.isFull = function (res) {
  return false;
}

export default Collection;