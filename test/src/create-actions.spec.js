'use strict';

import { expect } from 'chai';
import StoreUtil, { alt, Item } from '../../src';
import Q from 'q';

describe('createActions()', () => {
  var Actions, Store;

  beforeEach(() => {
    Actions = StoreUtil.createActions(class TestActions {

      constructor() {
        this.generateActions('foo', 'bar');
      }

    });

    Store = StoreUtil.createStore(class TestStore {

      constructor() {
        this.bindActions(Actions);
      }

      foo() {
        this.quz = 'xux';
      }

      onBar() {
        this.quz = 'sit';
      }

    }, null, false);
  });

  it ('work properly', () => {
    var storeState = Store.getState();
    var fooListener = function (state) {
      expect(state.quz).to.equal('xux');
      expect(storeState).to.not.equal('xux');
    };

    var barListener = function (state) {
      expect(state.quz).to.equal('sit');
      expect(storeState).to.not.equal('sit');
    };

    Store.listen(fooListener);
    Actions.foo();
    Store.unlisten(fooListener)

    Store.listen(barListener);
    Actions.bar();
    Store.unlisten(barListener);
  });

  it('updateItem() work properly', (done) => {
    var item = new Item({
      id: '__lorem__',
      foo: 'bar'
    }, {
      store: Store
    });

    var item2 = new Item({
      id: '__lorem__',
      foo: 'sit'
    }, {
      store: Store
    });

    Store.addItem(item);

    Store.listen(() => {
      var theItem = Store.getItem('__lorem__');
      expect(theItem.get('foo')).to.equal('sit');
      done();
    });

    Actions.updateItem(item2);
  });
});
