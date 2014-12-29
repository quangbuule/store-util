'use strict';

var _ = require('lodash');
var StoreUtil = require('./');

var StateHandlerMixin = {
  componentWillMount: function () {
    this._storeUnsubscribers = {};
  },

  setStateHandlers: function (stateHandlers) {
    var self = this;

    _.forEach(stateHandlers, function (handler, propName) {
      var _didRetrieve = _.once(function () {
          var fn = self[propName + 'DidRetrieve'];
          if (_.isFunction(fn)) {
            _.defer(fn);
          }
        });

      var _replaceStoreUbsubscriber = function () {
        // Remove state prop's listener
        if (_.isFunction(self._storeUnsubscribers[propName])) {
          self._storeUnsubscribers[propName]();
        }

        // Add state prop's listener
        self._storeUnsubscribers[propName] = handler.listen(function (payload) {
          if (!self.isMounted()) {
            return;
          }

          var newState = _.zipObject([ propName ], [ payload ]);

          if (handler.Constructor === StoreUtil.Item) {
            _.defaults(newState[propName], self.state[propName]);
          }

          self.setState(newState);

          if (payload.isRetrieved === true) {
            _didRetrieve();
          }
        });
      };

      handler.initialize();
      _replaceStoreUbsubscriber();
      handler.retrieve();
    });
  },

  retrieveState: function () {
    if (_.isUndefined(this.getInitialStateHandlers)) {
      return;
    }

    this.setStateHandlers(this.getInitialStateHandlers());
  },

  componentWillUnmount: function () {
    _.each(this._storeUnsubscribers, function (unsubscriber) {
      unsubscriber();
    });
  }
};

module.exports = StateHandlerMixin;
