'use strict';

import getClassStatics from 'get-class-statics';
import { alt } from './';

function createActions(ActionsModel) {
  var additionalActions = [ 'getItem', 'updateItem' ];
  var _constructor = ActionsModel.prototype.constructor;

  ActionsModel.prototype.constructor = function () {
    this.generateActions(...additionalActions);
    return _constructor.call(this);
  };

  return alt.createActions(ActionsModel);
}

export default createActions;
