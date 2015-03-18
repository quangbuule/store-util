'use strict';

import StoreUtil, { Item, Collection } from './';

class StoreQuery {

  construtor() {
    // Constructor
  }

  requireItem(id, requiredProps) {
    if (typeof requiredProps === 'string') {
      requiredProps = [ requiredProps ];
    }

    this.type = Item;
    this.id = id;
    this.requiredProps = requiredProps;

    return this;
  }

  from(store) {
    this.store = store;
    return this;
  }

  fallback(methodName, ...args) {
    if (!this.store) {
      throw new Error('The query\'s store haven\'t been set.');
    }

    this.retrieve = this.store[methodName].bind(this.store, ...args);
    return this;
  }

}

export default StoreQuery;
