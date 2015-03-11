'use strict';

import Q from 'q';
import StoreUtil, { Item } from '../src';
import { expect } from 'chai';
import when from '../when';

describe('when()', () => {
  var Store = StoreUtil.createStore(class {});
  var item = new Item({
    id: '__lorem__',
    foo: 'bar'
  }, {
    store: Store,
    retrieve: () => {
      var df = Q.defer();
      var res = {
        data: {
          quz: 'bar'
        }
      };

      setTimeout(() => {
        df.resolve(res);
      }, 0);

      return df.promise;
    }
  });

  Store.addItem(item);

  it('work properly', (done) => {
    var calls = 0;

    Store.listen(() => {
      var newItem = Store.getItem('__lorem__');
      var val = when(newItem, {
        retrieving: 'foo',
        done: 'bar',
      });

      calls++;

      try {
        if (calls === 1) {
          expect(val).to.equal('foo');
        }

        if (calls === 2) {
          expect(val).to.equal('bar');
          done();
        }
      } catch(err) {
        done(err);
      }
    });

    item.retrieve();
  });
});
