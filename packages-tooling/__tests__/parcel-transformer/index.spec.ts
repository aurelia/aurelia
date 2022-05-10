import { assert } from '@aurelia/testing';
import transformer from '@aurelia/parcel-transformer';

describe('parcel-transformer', function () {
  it('wait for official parcel2 example on unit tests :-)', function (done) {
    assert.equal(typeof transformer, 'object');
    done();
  });
});
