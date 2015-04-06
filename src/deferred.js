'use strict';

import Promise from 'native-promise-only';

class Deferred {

  constructor() {
    this.state = 'pending';

    this.promise = new Promise((resolve, reject) => {
      this.resolve = value => {
        resolve(value);
        this.state = 'fulfilled';
      };

      this.reject = value => {
        reject(value);
        this.state = 'rejected';
      };
    });
  }
}

export default Deferred;
