'use strict';

var _ = require('lodash');
var Reflux = require('reflux');

function Action(specs) {
  _.assign(Reflux.ActionMethods, Action.methods);
  return Reflux.createAction(specs);
};

Action.methods = {};

module.exports = Action;
