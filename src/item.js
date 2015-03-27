'use strict';

import alt from 'alt';
import Immutable, { Map } from 'immutable';
import Model from './model';

class Item extends Model {

  constructor(rawData, props) {
    props = props || new Object;
    props.data = new Map(rawData);

    return super(props);
  }

  _dataDidRetrieve() {
    var rawData = this._parse();

    this.merge(rawData)
      .commitChange();
  }
}

Item.displayName = 'Item';

Item.idAttribute = 'id';

Item.parse = function () {
  return this.payload.response.data;
}

export default Item;
