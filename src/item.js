'use strict';

import alt from 'alt';
import Immutable from 'immutable';
import Model from './model';

class Item extends Model {

  constructor(rawData, props) {
    props = props || new Object;
    props.data = rawData ? Immutable.fromJS(rawData) : Immutable.Map();

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
