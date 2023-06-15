// @ts-check
import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import util from 'node:util';

import resolvePackagePath from 'resolve-package-path';
import yn from 'yn';

import { ENV_ENABLE, friendlyName } from '../shared.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * This plugin will only setup tests when the `isEnabled` option is true.
 * By default this is false, except when using the a-proper-test-launcher CLI tool.
 *
 * The a-proper-test-launcher CLI tool is used to launch browsers (and headlessly launch them)
 * as well as determine which port `vite` is running on.
 *
 * @typedef {object} Options;
 * @property {boolean} [isEnabled]
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

  const isActive = options.isEnabled ?? yn(process.env[ENV_ENABLE]);

  if (!isActive) {
    return {
      name: `[Disabled] ${friendlyName}`,
    };
  }

  return {
    name: friendlyName,
    /**
     * Setup middleware for listening for progress
     */
    async configureServer(server) {
      /**
       * Setup websocket handler for receiving test progress
       */
      // console.log(util.inspect(server, { depth: 2, colors: true }));
    },

    transformIndexHtml() {
      return [
        {
          tag: 'script',
          injectTo: 'head',
          attrs: {
            type: 'module',
            src: 'a-proper-test-launcher',
          },
        },
      ];
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

function getTestemDirectory() {
  let testemManifestPath = resolvePackagePath('testem', __dirname);

  assert(testemManifestPath, 'Something went wrong resolving `testem`');

  return path.dirname(testemManifestPath);
}
