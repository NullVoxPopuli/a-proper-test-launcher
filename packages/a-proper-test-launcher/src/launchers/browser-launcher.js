// @ts-check
// import fs from 'node:fs/promises';
import assert from 'node:assert';
import path from 'node:path';

import fse from 'fs-extra';
import Testem from 'testem';
import { createServer } from 'vite';

/**
 * @typedef {import('@web/test-runner-core').BrowserLauncher} BrowserLauncher
 */

const CWD = process.cwd();
const MJS_EXT = ['.js', '.mjs'];
const isCI = process.env['CI'];

/**
  * 1. Start Vite with the proxy to Testem enabled
  * 2. Start Testem with a known port that vite will proxy to
  *
  *
 * @param {object} [ runtimeConfig ]
 */
export async function launch(runtimeConfig = {}) {
  let testem = new Testem();

  let server = await createServer({ root: CWD, clearScreen: false, open: false });
  let running = await server.listen();
  let info = running.httpServer?.address();

  running.printUrls();

  testem.setDefaultOptions({
    config_dir: CWD,
  });

  return new Promise((resolve, reject) => {
    testem.startCI({
      host: 'localhost',
      port: info.port,
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
    })
  });
}

