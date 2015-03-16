'use strict';

import StoreUtil, { Item, Collection } from 'store-util';

var stateBindingMixin = {

  componentWillMount() {
    var initialState = new Object;
    var instances = [];
    var stateBindingOptions = this.bindState();

    this.stateUnbindMethods = new Object;

    Object.keys(stateBindingOptions).forEach((stateName) => {
      var { type, id, store, retrieve } = stateBindingOptions[stateName];
      var instance, addInstance, getInstance;

      if (type === Collection) {
        instance = new Collection([], { id, store, retrieve });
        addInstance = store.addCollection.bind(store);
        getInstance = store.getCollection.bind(store);
      }

      if (type === Item) {
        instance = new Item ({}, { id , store, retrieve });
        addInstance = store.addItem.bind(store);
        getInstance = store.getItem.bind(store);
      }

      initialState[stateName] = instance;

      // Listener for unbind
      var listener = () => {
        var newInstance = getInstance(id);

        if (instance === newInstance) {
          return;
        }

        instance = newInstance;
        this.setState({ [ stateName ]: instance });
      };

      store.listen(listener);

      // Unbind the existed
      if (this.stateUnbindMethods[stateName]) {
        this.stateUnbindMethods[stateName]();
      }

      // Add method to unbind when component will unmount
      this.stateUnbindMethods[stateName] = store.unlisten.bind(store, listener);

      // Add instance to store
      addInstance(instance);
      instances.push(instance);
    });

    this.setState(initialState);
    instances.forEach(instance => instance.retrieve((err) => {
      console.error(err.stack);
    }));
  },

  componentWillUnmount() {
    Object.keys(this.stateUnbindMethods).forEach(stateName => this.stateUnbindMethods[stateName]());
  }
};

module.exports = stateBindingMixin;
