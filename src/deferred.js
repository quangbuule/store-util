'use strict';

import Promise from 'native-promise-only';

class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve.bind(null);
      this.reject = reject.bind(null);
    });
  }
}

export default Deferred;
