'use strict';

var Status = {
  INITIAL: 1,
  RETRIEVING: 2,
  DONE: 4,
  RETRIEVING_MORE: 8,
  FULL: 16
};


[ 'INITIAL', 'RETRIEVING', 'DONE', 'RETRIEVING_MORE', 'FULL' ].forEach((constName) => {
  Object.defineProperty(Status, constName, {
    writable: false,
    enumerable: true
  });
});

export default Status;
