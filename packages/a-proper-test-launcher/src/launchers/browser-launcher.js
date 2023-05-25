// @ts-check
// import fs from 'node:fs/promises';
import assert from 'node:assert';
import path from 'node:path';

// import proxy from 'express-http-proxy';
import fse from 'fs-extra';
// import Testem from 'testem';
import { createServer } from 'vite';

import { ENV_ENABLE } from '../shared.js';

const CWD = process.cwd();
const MJS_EXT = ['.js', '.mjs'];
const isCI = process.env['CI'];

/**
 * 1. Start Vite with the proxy to Testem enabled
 * 2. Start Testem with a known port that vite will proxy to
 *
  * @typedef {object} Options
 * @property {boolean} [ serve ] -- testem, but in server mode
 * @property {boolean} [ dev ] -- vite only
 *
 * @param {Options} [ runtimeConfig ]
 */
export async function launch(runtimeConfig = {}) {
  let { dev, serve } = runtimeConfig;

  process.env[ENV_ENABLE] = 'true';

  
  if (dev) {
    let server = await createServer({ root: CWD, clearScreen: false, open: false });
    let running = await server.listen();

    running.httpServer?.address();

    running.printUrls();

    return;
  }

  process.env['VITE_CLI_REPORTER'] = 'true';

  let server = await createServer({ root: CWD, clearScreen: false, open: false });
  let running = await server.listen();
  let info = running.httpServer?.address();
  let testReporterPort = (info?.port ?? 7000) + 1;

  server.middlewares.use((req, res, next) => {
    console.log(req.url); 
    next();
  });

  let testem = new Testem();

  // https://github.com/testem/testem/blob/master/lib/api.js#L10
  testem.setDefaultOptions({
    config_dir: CWD,
    fail_on_zero_tests: true,
    // https://github.com/testem/testem/blob/master/lib/server/index.js#L214
    // proxies: [`localhost:${info.port}`],
    // on_exit: () => server.close(),
  });

  let isHeadless = isCI || !runtimeConfig.serve; 

  if (isHeadless) {
    return new Promise((resolve, reject) => {
      // https://github.com/testem/testem/blob/master/lib/api.js#L10
      testem.startCI(
        {
          url: `http://localhost:${testReporterPort}`,
          file: path.join(CWD, 'testem.cjs'),
        },
        /**
         * @param {number} exitCode
         * @param {string} error
         */
        (exitCode, error) => {
          if (error) {
            reject(error);
          } else if (exitCode !== 0) {
            reject('Testem finished with non-zero exit code. Tests failed.');
          } else {
            resolve(exitCode);
          }
        }
      );
    });
  } else {
    testem.startDev();
  }
}
