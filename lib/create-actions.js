'use strict';

var _ = require('lodash');
var StoreUtil = require('./');

function createActions(actionNames) {
  var actions = {};

  actionNames = _.union([ 'get', 'update', 'cache' ], actionNames);
  actionNames.forEach(function (actionName) {
    actions[actionName] = new StoreUtil.Action();
  });

  return actions;
};

module.exports = createActions;
