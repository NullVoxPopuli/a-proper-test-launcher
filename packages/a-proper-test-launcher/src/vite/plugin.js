// @ts-check
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

import { handleProgress } from './handle-progress.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * @typedef {object} Options;
 * @property {'qunit' | 'custom'} [ using ] test framework to use
 *
 * @param {Options} [ options ]
 * @returns {import('vite').Plugin}
 */
export function aProperTestLauncher(options = {}) {
  /** @type {import('vite').ViteDevServer} */
  // let _server;

  /** @type {Options['using']} */
  let testFramework = options?.using ?? 'qunit';

  const cwd = process.cwd();

  return {
    name: `A _proper_ test launcher`,
    /**
     * Setup middleware for listening for progress
     */
    async configureServer(server) {
      // _server = server;

      /**
       * Setup websock handler for receiving test progress
       */
      handleProgress(server.ws);
    },

    resolveId(id) {
      if (id.startsWith('/a-proper-test-launcher')) {
        return `aptl:${id}`;
      }
      // remaps the import glob
      if (id.startsWith('@root')) {
        return id.replace('@root', cwd);
      }

      return;
    },
    load(id) {
      if (id.startsWith('aptl:')) {
        let name = id.replace('aptl:', '');

        if (name.startsWith('/a-proper-test-launcher')) {
          switch (testFramework) {
            case 'qunit': {
              return fs.readFile(path.join(__dirname, 'templates/qunit.js'), 'utf8');
            }
          }
        }
        return;
      }

      return;
    },
  };
}
