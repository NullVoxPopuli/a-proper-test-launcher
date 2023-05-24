# a-proper-test-launcher

Have a pre-existing build system?
Or a pre-existing way of running tests in the browser?

_But don't have a way to run tests from the CLI in any browser? (especially for CI?)_

This is *the* tool for you. 
A no fuss test-launcher, supporting any browser on your system. 
No need to download copies of browsers or drivers for browsers, like puppeteer or playwright.

## Install

``` 
pnpm add <tbd>
```

## Setup 

### With Vite

```ts 
// vite.config.js
import { defineConfig } from 'vite';
import { aProperTestLauncher } from 'a-proper-test-launcher/vite';


export default defineConfig({
    plugins: [
       aPropertTestLauncher({
            using: 'qunit', // 'qunit' | 'mocha' | 'custom'
       }), 
    ]
});
```

and then in the index.html:
```html 
<script type="module" src="a-proper-test-launcher"></script>
```

## Supported test frameworks

### QUnit

This is set up automatically via `using: 'qunit'` (which is default)

### Custom

To use a custom test framework, we need to configure both the server and the client.


In the vite config:
```ts 
// vite.config.js
import { defineConfig } from 'vite';
import { aProperTestLauncher } from 'a-proper-test-launcher/vite';


export default defineConfig({
    plugins: [
       aPropertTestLauncher({
            using: 'custom',
       }), 
    ]
});
```

and then in your tests' index.html, you'll want to connect the progress reporter:
```html 
<script type="module">
    import { progress } from 'tbd';

    // MyTestFramework would be something you are integrating with or wrote yourself
    // (Mocha, Jasmine, etc)
    MyTestFramework.on('start', (data) => {
      progress.report('start', {
        totalTests: data.describeCount,
        totalSuties: data.testCount,
      });
    });
    MyTestFramework.on('finish', (data) => {
      progress.report('finish', {
        duration: data.durationMs 
      });
    });
    MyTestFramework.on('describe#start', (data) => {
      progress.report('suite:start', {
        name: data.describeName 
      });
    });
    MyTestFramework.on('describe#finish', (data) => {
      progress.report('suite:finish', {
        name: data.describeName,
        duration: data.durationMs,
        passingTests: data.passedTests,
        failingTests: data.failedTests,
      });
    });
    MyTestFramework.on('test#start', (data) => {
      progress.report('test:start', {
        name: data.testName,
        suite: data.describeName 
      });
    });
    MyTestFramework.on('test#finish', (data) => {
      progress.report('test:finish', {
        name: data.testName,
        suite: data.describeName, 
        duration: data.durationMs,
        passingAssertions: data.passedCount,
        failingAssertions: data.failedAssertions,,
        isSkipped: data.isSkipped,
      });
    });
</script>
```

## Supported browsers

Anything installed on your system. 

Cross-platform aliases provided by [`open`](https://www.npmjs.com/package/open)

Recommended to use [browser launchers provided by Modern Web](https://modern-web.dev/docs/test-runner/browser-launchers/overview/), specifically, [web-driver](https://modern-web.dev/docs/test-runner/browser-launchers/webdriver/) (used by  default).

Browser launching is implemented with the `@dev/test-runner` browser launcher API, so any of their launchers are supported as well.

## Supported servers / bundlers

All of them.



When used standalone:

This tool has two modes:
 1. point at an existing host / port 
 2. serve static files and go-to 1.

When using the vite plugin, host/port mapping is automatic. The vite plugin is what launches the browsers. 

## Tech-related questions

### Why default with QUnit?

Most test frameworks' tests early-exit on any failure. This gives you an incomplete view of your test's state.

With QUnit, you can get the whole overview of a test, see that later assertions pass after a failure -- allowing for much quicker and tighter developer feedback loop.

### Why not `@playwright/test`?

`@playwright/test` a _test launcher_[^test_launcher], which is designed for end-to-end tests which run in a node environment.

### Why not Puppeteer?

Puppeteer is a _browser driver_[^browser_driver] and only launches Chrome / Chromium, and we need to support all browsers.

### Why not vitest?

Vitest originally only supported running tests in node.
They later added the ability to run tests in the browser, but only with their test framework.


[^test_launcher]: existing versions of these tools will want to know what test files you have, and generally also include their own build. Tools that connect to an existing server that has tests and allows them to run would be considered a "test launcher", but "test launcher" is so tied to node-testing, that the phrase isn't very useful to us.
[^browser_driver]: these tools can control browsers from within node.
