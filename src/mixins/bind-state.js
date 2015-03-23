'use strict';

import { Item, Collection, Model, Status, Promise, Deferred } from 'store-util';

function addStateDeferred(stateName) {
  if (this._stateDeferred[stateName]) {
    return;
  }

  this._stateDeferred[stateName] = new Deferred;
}

function bindState(stateName, bindingOptions) {
  var { type, id, store, inst } = bindingOptions;

  this.setState({ [ stateName ]: inst });

  if (id === null || id === undefined) {
    return;
  }

  var listener = () => {
    var newInst = store[`get${type.displayName}`](id);

    if (inst === newInst) {
      return;
    }

    inst = newInst;

    if (inst.isDone) {
      this._stateDeferred[stateName].resolve(inst);
    }

    // TODO: Check if the component is unMounted
    this.setState({ [ stateName ]: inst });
  };

  store.listen(listener);

  // Unbind the existed
  if (this._stateUnbindMethods[stateName]) {
    this._stateUnbindMethods[stateName]();
  }

  // Add method to unbind when component will unmount
  this._stateUnbindMethods[stateName] = store.unlisten.bind(store, listener);
}

function waitForCase(stateName, bindingOptions) {
  var { waitFor, then } = bindingOptions;
  waitFor = typeof waitFor === 'string' ? [ waitFor ] : waitFor;

  Promise.all(waitFor.map(stateName => this._stateDeferred[stateName].promise))
    .then((insts) => {
      addStateBindingOptions.call(this, stateName, then(...insts));
    });

  this.setState({ [ stateName ]: new Model({ status: Status.RETRIEVING }) });
}

function reuseCase(stateName, bindingOptions) {
  var { type, id, store, retrieve } = bindingOptions;
  var inst;

  if (type === Item) {
    inst = store.getItem(id);
  }
  // TODO: handle collection case

  if (inst.isDone) {
    this._stateDeferred[stateName].resolve(inst);
  }

  bindingOptions.inst = inst;
  bindState.call(this, ...arguments);
}

function retrieveCase(stateName, bindingOptions) {
  var { type, id, store, retrieve } = bindingOptions;
  var status = Status.RETRIEVING; // TODO: Set initial status of instance to retrieving
  var existedInst, inst;

  existedInst = store[`get${type.displayName}`](id);
  inst = new type(null, { id, store, retrieve });

  bindingOptions.inst = inst;
  bindState.call(this, ...arguments);

  // Add inst to store
  if (existedInst && type === Item) {
    existedInst
      .setRetrieve(retrieve)
      .retrieve()
      .commitChange();

  } else {
    store[`add${type.displayName}`](inst);
    inst.retrieve();
  }
}

function addStateBindingOptions(stateName, bindingOptions) {
  var { type, id, store, retrieve, requiredProps } = bindingOptions;
  var { waitFor, then } = bindingOptions;

  if (waitFor) {
    return waitForCase.call(this, ...arguments);
  }

  if (id === null || id === undefined) {
    return this.setState({ [ stateName ]: id });
  }

  var existedInst;

  if (type === Item) {
    existedInst = store.getItem(id);
  }

  var valid = existedInst && requiredProps &&
    requiredProps.reduce(function (prev, curr) {
      return (existedInst.get(curr) !== undefined) && prev;
    }, true);

  if (valid) {
    return reuseCase.call(this, ...arguments);
  }

  return retrieveCase.call(this, ...arguments);
}

export default {

  componentWillMount() {
    var stateBindingOptions = this.bindState();
    this._stateUnbindMethods = new Object;
    this._stateDeferred = new Object;

    Object.keys(stateBindingOptions).forEach(stateName => addStateDeferred.call(this, stateName));
    Object.keys(stateBindingOptions).forEach((stateName) => {
      addStateBindingOptions.call(this, stateName, stateBindingOptions[stateName]);
    });
  },

  waitForStateReady(stateName, callback) {
    return { waitFor: stateName, callback };
  },

  componentWillUnmount() {
    Object.keys(this._stateUnbindMethods).forEach(stateName => this._stateUnbindMethods[stateName]());
  }
};
