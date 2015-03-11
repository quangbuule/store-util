'use strict';

module.exports = function (instance, options) {
  return options[instance.status];
};
