// @ts-check
import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

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
      return () => setupTestem(server);
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
        {
          tag: 'script',
          injectTo: 'head',
          attrs: {
            src: 'testem.js',
          },
        },
      ];
    },

    resolveId(id) {
      if (id === '/testem.js') {
        return `aptl:${id}`;
      }

      if (id.startsWith('/a-proper-test-launcher')) {
        return `aptl:${id}`;
      }

      // remaps the import glob
      if (id.startsWith('@root')) {
        return id.replace('@root', cwd);
      }

      return;
    },
    async load(id) {
      if (id.startsWith('aptl:')) {
        let name = id.replace('aptl:', '');

        if (name.startsWith('/testem')) {
          let content = '';
          let testemPath = getTestemDirectory();

          content += await fs.readFile(path.join(testemPath, 'public/testem/decycle.js'));
          content += await fs.readFile(path.join(testemPath, 'public/testem/jasmine2_adapter.js'));
          content += await fs.readFile(path.join(testemPath, 'public/testem/jasmine_adapter.js'));
          content += await fs.readFile(path.join(testemPath, 'public/testem/mocha_adapter.js'));
          content += await fs.readFile(path.join(testemPath, 'public/testem/qunit_adapter.js'));
          content += await fs.readFile(path.join(testemPath, 'public/testem/testem_client.js'));

          return content;
        }

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

function getSocketIODirectory() {
  let socketManifestPath = resolvePackagePath('socket.io', getTestemDirectory());

  assert(socketManifestPath, 'Something went wrong resolving `socket.io`');

  return path.dirname(socketManifestPath);
}

/**
 *
 * @param {import('vite').ViteDevServer} server
 */
function setupTestem(server) {
  server.middlewares.use(async (req, res, next) => {
    if (req.url === '/testem/connection.html') {
      let realLocation = path.join(getTestemDirectory(), 'public/testem/connection.html');
      let file = await fs.readFile(realLocation);

      res.setHeader('Content-Type', 'text/html' + '; charset=utf-8');
      res.setHeader('Content-Length', Buffer.byteLength(file, 'utf8'));
      res.end(file, 'utf8');
    }

    // For refreshing when the build changes..
    if (req.url === '/socket.io/socket.io.js') {
      let realLocation = path.join(getSocketIODirectory(), 'client-dist/socket.io.js');
      let file = await fs.readFile(realLocation);

      res.setHeader('Content-Type', 'text/javascript' + '; charset=utf-8');
      res.setHeader('Content-Length', Buffer.byteLength(file, 'utf8'));
      res.end(file, 'utf8');
    }

    if (req.url === '/testem/testem_connection.js') {
      let realLocation = path.join(getTestemDirectory(), 'public/testem/testem_connection.js');
      let file = await fs.readFile(realLocation);

      res.setHeader('Content-Type', 'text/javascript' + '; charset=utf-8');
      res.setHeader('Content-Length', Buffer.byteLength(file, 'utf8'));
      res.end(file, 'utf8');
    }

    next();
  });
}
