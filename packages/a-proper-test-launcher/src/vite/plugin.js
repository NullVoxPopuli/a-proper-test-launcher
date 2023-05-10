// @ts-check

import { handleProgress } from './handle-progress.js';
import { ensureQunitReporter } from './qunit.js';

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
    /**
     * If the middleware is expecting a known test framework,
     * insert the progress reporter automatically
     */
    async transformIndexHtml(html) {
      let testFramework = options?.using ?? 'qunit';

      switch (testFramework) {
        case 'qunit': {
          return ensureQunitReporter(html);
        }
      }

      return html;
    },
  };
}
