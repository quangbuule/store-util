'use strict';

import { Record } from 'immutable';
import StoreUtil, { Status } from './';

var schema = new Object;

[ 'store', 'idAttribute', 'status', 'retrieve', 'retrieveMore', 'parse', 'isFull',
  'payload', 'data' ].forEach((propName) => {
  Object.defineProperty(schema, propName, { value: null });
});

Object.defineProperty(schema, 'id', { value: null, enumerable: true });

class Model extends Record(schema) {

  constructor (props) {
    var Item = StoreUtil.Item;
    var Collection = StoreUtil.Collection;
    var isItem = this instanceof Item;
    var isCollection = this instanceof Collection;

    // Model's store
    props.store = props.store || new Object;

    // Model's status
    props.status = props.status || Status.INITIAL;

    // Model's idAttribute
    props.idAttribute = props.idAttribute || props.store.idAttribute || Item.idAttribute;

    // Model's id
    props.id = props.id || isItem && props.data.get(props.idAttribute);

    // Model's parse method
    props.parse = props.parse ||
      (isItem && (props.store.parseItem || Item.parse)) ||
      (isCollection && (props.store.parseCollection || Collection.parse));

    // Model's check isFull method
    props.isFull = props.isFull ||
      (isCollection && (props.store.isCollectionFull || Collection.isFull));

    // Model's retrieveMore method
    props.retrieveMore = props.retrieveMore ||
      (isCollection && (props.store.retrieveMore || Collection.retrieveMore));

    return super(props);
  }

  get id() {
    return super.get('id');
  }

  get status() {
    return super.get('status');
  }

  get store() {
    return super.get('store');
  }

  get payload() {
    return super.get('payload');
  }

  get _data() {
    return super.get('data');
  }

  get _retrieve() {
    return super.get('retrieve');
  }

  get _retrieveMore() {
    return super.get('retrieveMore');
  }

  get _parse() {
    return super.get('parse');
  }

  get isInitial() {
    return Boolean(super.get('status') & Status.INITIAL);
  }

  get isRetrieving() {
    return Boolean(super.get('status') & Status.RETRIEVING);
  }

  get isRetrievingMore() {
    return Boolean(super.get('status') & Status.RETRIEVING_MORE);
  }

  get isDone() {
    return Boolean(super.get('status') & Status.DONE);
  }

  get isFull() {
    return Boolean(super.get('status') & Status.FULL);
  }

  get _isFull() {
    return super.get('isFull');
  }

  get(key) {
    return this._data.get(key);
  }


  toObject() {
    return this._data.toObject();
  }

  toJSON() {
    return this._data.toJSON();
  }

  clear() {
    return this._setData(this._data.clear(...args));
  }

  _setStatus(status) {
    return super.set('status', status);
  }

  setPayload(payload) {
    return super.set('payload', payload);
  }

  setRetrieve(retrieve) {
    return super.set('retrieve', retrieve);
  }

  _setData(newData) {
    return super.set('data', newData);
  }

  set(...args) {
    return this._setData(this._data.set(...args));
  }

  merge(...args) {
    return this._setData(this._data.merge(...args));
  }

  update(newInst) {
    return this.merge(newInst._data)
      ._setStatus(newInst.status || this.status);
  }

  retrieve(callback) {
    if (this.isRetrieving) {
      return;
    }

    var newInst = this._setStatus(Status.RETRIEVING)
      .commitChange();

    newInst._retrieve()
      .then((payload) => {
        return newInst.setPayload(payload)
          ._setStatus(Status.DONE)
          ._dataDidRetrieve();
      })
      .catch((err) => {
        callback && callback(err);
      });

    return newInst;
  }

  retrieveMore(callback) {
    if (!(this instanceof StoreUtil.Collection) ||
      this.isRetrieving ||
      this.isRetrievingMore ||
      this._isFull()) {
      return;
    }

    var newInst = this._setStatus(this.status | Status.RETRIEVING_MORE)
      .commitChange();

    newInst._retrieveMore()
      .then((payload) => {
        return newInst.setPayload(payload)
          ._setStatus(Status.DONE)
          ._dataDidRetrieve();
      })
      .catch((err) => {
        callback && callback(err);
      });

    return newInst;
  }

  done() {
    return this._setStatus(Status.DONE);
  }

  commitChange() {
    this.store.commitChange(this);
    return this;
  }

}

export default Model;
