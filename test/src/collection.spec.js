'use strict';

import Immutable, { List } from 'immutable';
import { expect } from 'chai';
import StoreUtil, { Status, Item, Collection } from '../../src';
import { simulateAPICall } from '../util';
import Q from 'q';

describe('Collection', () => {
  var store, collection;

  beforeEach(() => {
    store = StoreUtil.createStore(class TestStore {
    }, null, false);

    collection = new Collection([{
      id: '__lorem__',
      foo: 'bar'
    }, {
      id: '__ipsum__',
      foo: 'sit'
    }], {
      id: '__dolor_collection__',
      store: store,

      retrieve: simulateAPICall({
        data: [{
          id: '__ipsum__',
          foo: 'new sit'
        }, {
          id: '__dolor__',
          foo: 'amet'
        }]
      }),

      retrieveMore: simulateAPICall({
        data: [{
          id: '__ipsum__',
          foo: 'new sit'
        }, {
          id: '__dolor__',
          foo: 'amet'
        }]
      })
    });
  });

  it('#constructor() work properly', () => {

  });

  it('#retrieve() work properly', (done) => {
    var calls = 0;

    store.addCollection(collection);

    store.listen(() => {
      var newCollection = store.getCollection(collection.id);
      if (newCollection === collection) {
        return;
      }

      calls++;
      collection = newCollection;

      if (calls === 1) {
        expect(newCollection.status).to.equal(Status.RETRIEVING);
      }

      if (calls === 2) {
        expect(newCollection.status).to.equal(Status.DONE);
        expect(collection.get(1).get('foo')).to.equal('new sit');
        expect(store.getItem('__ipsum__').get('foo')).to.equal('new sit');
        done();
      }

    });

    collection.retrieve(done);
  });

  it ('#retrieveMore() work properly', (done) => {
    var calls = 0;

    store.addCollection(collection);

    store.listen(() => {
      var newCollection = store.getCollection(collection.id);
      if (newCollection === collection) {
        return;
      }

      calls++;

      collection = newCollection;

      try {
        if (calls === 2) {
          collection.retrieveMore();
          return;
        }

        if (calls === 3) {
          expect(newCollection.status).to.equal(Status.RETRIEVING_MORE);
          return;
        }

        if (calls === 4) {
          expect(newCollection.size).to.equal(6);
          done();
        }
      } catch(err) {
        done(err);
      }
    });

    collection.retrieve();
  });

  it ('#isFull() work properly', (done) => {
    var collection = new Collection([{
      id: '__ipsum__',
      foo: 'new sit'
    }, {
      id: '__dolor__',
      foo: 'amet'
    }], {
      store: store,
      retrieve: simulateAPICall({
        data: [{
          id: '__ipsum__',
          foo: 'new sit'
        }, {
          id: '__dolor__',
          foo: 'amet'
        }],
        skip: 20,
        limit: 10,
        count: 30
      }),

      isFull: function () {
        var response = this.response;
        return (response.skip + response.limit) >= response.count;
      }
    });

    store.addCollection(collection);

    store.listen(function () {
      var newCollection = store.getCollection(collection.id);
      if (newCollection === collection) {
        return;
      }

      collection = newCollection;

      try {
        if (collection.status === Status.DONE) {
          expect(collection.isFull()).to.be.true;
          done();
        }
      } catch(err) {
        console.log(err.stack);
      }
    });

    collection.retrieve();
  });
});
