'use strict';

import { expect } from 'chai';
import StoreUtil, { alt, Item } from '../../src';
import Q from 'q';

describe('Store instance', () => {

  var Store;

  beforeEach(() => {
    Store = StoreUtil.createStore(class Store {
    }, null, false);
  });

  describe('Working with items', () => {

    it('#addItem(item) add item to Store', () => {
      var item = new Item({
        id: 'lorem',
        foo: 'bar'
      }, {
        store: Store
      });

      Store.addItem(item);
      expect(Store.getItem('lorem')).to.deep.equal(item);
    });

    it('#addOrUpdateItems() add item(s) to Store when the Store don\'t have them', () => {
      var item = new Item({
        id: 'lorem',
        foo: 'bar'
      }, {
        store: Store
      });

      Store.addOrUpdateItems(item);
      expect(Store.getItem('lorem')).to.deep.equal(item);

      var items = [ new Item({
        id: 'ipsum',
        foo: 'bar'
      }, {
        store: Store
      }), new Item({
        id: 'dolor',
        foo: 'bar'
      }, {
        store: Store
      }) ];

      Store.addOrUpdateItems(items);
      expect(Store.getItem('ipsum')).to.deep.equal(items[0]);
      expect(Store.getItem('dolor')).to.deep.equal(items[1]);
    });

    it('#addOrUpdateItems update item(s) to Store the Store has them already', () => {
      var item = new Item({
        id: 'lorem',
        foo: 'bar'
      }, {
        store: Store
      });

      Store.addItem(item);

      var item2 = new Item({
        id: 'lorem',
        foo: 'bar2'
      }, {
        store: Store
      });

      Store.addOrUpdateItems(item2);
      expect(Store.getItem('lorem').get('foo')).to.equal('bar2');
    });
  });
});
