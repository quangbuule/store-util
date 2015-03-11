'use strict';

import Immutable, { Map } from 'immutable';
import { expect } from 'chai';
import StoreUtil, { Status, Item } from '../../src';
import { simulateAPICall } from '../util';
import Q from 'q';

describe('Item', () => {
  var store, item;

  beforeEach(() => {
    store = StoreUtil.createStore(class TestStore {
    }, null, false);

    item = new Item({
      id: '__lorem__',
      foo: 'bar'
    }, { store });

    store.addItem(item);
  });

  it('#constructor() work properly', () => {
    expect(item.get('foo')).to.equal('bar');
    expect(item.id).to.equal('__lorem__');
    expect(item.status).to.equal(Status.INITIAL);
  });

  it('#get() work properly', () => {
    expect(item.get('foo')).to.equal('bar');
  });

  it('#set() work properly', () => {
    var newItem = item.set('foo', 'bar2');

    expect(item.get('foo')).to.equal('bar');
    expect(newItem.get('foo')).to.equal('bar2');
    expect(newItem).not.to.equal(item);
  });

  it('#merge() work properly', () => {
    var newItem = item.merge({ dolor: 'sit' });
    expect(newItem.get('dolor')).to.equal('sit');
  });

  it('#update() work properly', () => {
    var item2 = new Item({
      id: '__lorem__',
      foo: 'sit'
    }, { store });
    var newItem = item.update(item2);

    expect(newItem.get('foo')).to.equal('sit');
  });

  it('#retrieve() work properly', (done) => {
    var calls = 0;
    var item = new Item({
      id: '__dolor__',
      foo: 'bar'
    }, {
      store,
      retrieve: simulateAPICall({
        data: {
          quz: 'bar'
        }
      })
    });

    store.addItem(item);

    store.listen(() => {
      var newItem = store.getItem(item.id);

      if (newItem === item) {
        return;
      }

      calls++;

      try {
        if (calls === 1) {
          expect(newItem).not.to.equal(item);
          item = newItem;
          expect(newItem.status).to.equal(Status.RETRIEVING);
          expect(newItem.get('quz')).to.not.equal('bar');
        }

        if (calls === 2) {
          expect(newItem).not.to.equal(item);
          item = newItem;
          expect(newItem.status).to.equal(Status.DONE);
          expect(newItem.get('quz')).to.equal('bar');
          done();
        }

      } catch(err) {
        done(err);
      }
    });

    item.retrieve();
  });

});
