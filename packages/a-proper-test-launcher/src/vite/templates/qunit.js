// @ts-ignore
/* eslint-disable */
import 'qunit/qunit/qunit.css';

import QUnit from 'qunit/qunit/qunit.js';

QUnit.config.autostart = false;

const testFiles = await import.meta.glob('@root/tests/**/*-test.{js,ts,mjs,mts}');

// evaluate the tests before starting QUnit.
// This populates the Suites and Test names as well as
// lets us know which tests / suites are skipped
for (const [name, testSuite] of Object.entries(testFiles)) {
  await testSuite();
}

await Promise.resolve();

// QUnit's custom UI is inserted into divs with these IDs
const qunitDiv = document.createElement('div');

qunitDiv.id = 'qunit';

const qunitFixtureDiv = document.createElement('div');

qunitFixtureDiv.id = 'qunit-fixture';

document.body.append(qunitDiv, qunitFixtureDiv);

// TODO: is this needed? this was copied from glimmer-vm

// since all of our tests are synchronous, the QUnit
// UI never has a chance to rerender / update. This
// leads to a very long "white screen" when running
// the tests
//
// this adds a very small amount of async, just to allow
// the QUnit UI to rerender once per module completed
(function () {
  var start = Date.now();
  QUnit.testDone(function (test) {
    var gap = Date.now() - start;

    if (gap > 100) {
      return {
        then: function (resolve) {
          setTimeout(function () {
            start = Date.now();
            resolve();
          }, 10);
        },
      };
    }
  });

  QUnit.moduleDone(function () {
    // breathe after module
    return {
      then: function (resolve) {
        setTimeout(function () {
          start = Date.now();
          resolve();
        }, 10);
      },
    };
  });
})();

QUnit.start();
