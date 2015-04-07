'use strict';

import alt from 'alt';
import Immutable, { Seq } from 'immutable';
import { Status, Item } from './';
import Model from './model';

class Collection extends Model {

  constructor(rawData, props) {
    var store = props.store;
    var items = (rawData || []).map((itemRawData) => {
      return new Item(itemRawData, { store });
    });

    props.data = new Seq.Indexed(items).map((item) => {
      return store.getItem(item.id) || item;
    });

    return super(props);
  }

  get size() {
    return this._data.size;
  }

  injectItems() {
    this.store.addOrUpdateItems(this.toArray());
    return this._setData(this._data.map(item => this.store.getItem(item.id)));
  }

  _dataDidRetrieve() {
    var rawData = this._parse();
    var items = rawData.map((itemRawData) => {
      return new Item(itemRawData, {
        store: this.store,
        status: Status.DONE
      });
    });

    this.store.addOrUpdateItems(items);

    this.concat(items)
      .map((item) => {
        return this.store.getItem(item.id) || item;
      })
      ._setStatus(Status.DONE | (this._isFull() && Status.FULL))
      .commitChange();
  }
}

Collection.displayName = 'Collection';

Collection.idAttribute = 'id';

Collection.parse = function () {
  return this.payload.response.data;
}

Collection.isFull = function (res) {
  return false;
}

export default Collection;
