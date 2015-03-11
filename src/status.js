'use strict';

var Status = new Object;


[ 'INITIAL', 'RETRIEVING', 'DONE', 'RETRIEVING_MORE', 'FULL' ].forEach((constName) => {
  var constValue = constName.toLowerCase().replace(/_([a-z])/,
    function (_, p1) { return p1.toUpperCase() });

  Object.defineProperty(Status, constName, {
    value: constValue,
    writable: false,
    enumerable: true
  });
});

export default Status;
