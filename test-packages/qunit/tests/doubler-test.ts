import { module, test } from 'qunit';

import { doubler } from '../src';

module('Doubler', function () {
  test('doubles', async function (assert) {
    assert.strictEqual(doubler(2), 4);
  });
});
