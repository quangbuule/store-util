'use strict';

import Deferred from '../../src/deferred';
import { expect } from 'chai';

describe('Deferred', () => {
  var deferred;

  beforeEach(() => {
    deferred = new Deferred;
  });

  it('#resolve() work properly', (done) => {
    deferred.promise
      .then((v) => {
        expect(v).to.equal('resolved');
        done();
      })
      .catch(done);

    setTimeout(() => {
      deferred.resolve('resolved');
    }, 1);
  });

  it('#reject() work properly', (done) => {
    deferred.promise
      .then((v) => {}, (err) => {
        expect(err).to.equal('rejected');
        done();
      });

    setTimeout(() => {
      deferred.reject('rejected');
    }, 1);
  });
});
