// @ts-check
// import fs from 'node:fs/promises';
import assert from 'node:assert';
import path from 'node:path';

import { webdriverLauncher } from '@web/test-runner-webdriver';
import fse from 'fs-extra';

/**
 * @typedef {import('@web/test-runner-core').BrowserLauncher} BrowserLauncher
 */

/** @type {Record<string, (url: URL, args?: string[]) =>  any>} */
const DEFAULT_LAUNCHERS = {
  chrome: (url, args = ['--no-sandbox', '--headless']) =>
    webdriverLauncher({
      automationProtocol: 'webdriver',
      port: parseInt(url.port, 10),
      path: url.pathname,
      capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: [...args],
        },
      },
    }),

  firefox: (url, args = ['-headless']) =>
    webdriverLauncher({
      automationProtocol: 'webdriver',
      port: parseInt(url.port, 10),
      path: url.pathname,
      capabilities: {
        browserName: 'firefox',
        'moz:firefoxOptions': {
          args: [...args],
        },
      },
    }),
};

const CWD = process.cwd();
const CONFIG_NAME = 'a-proper-test-launcher.config';
const MJS_EXT = ['.js', '.mjs'];
const isCI = process.env['CI'];

/**
 * @param {object} [ runtimeConfig ]
 */
export async function launch(runtimeConfig = {}) {
  let config = await getConfig();

  config = Object.assign(config, runtimeConfig);

  if (isCI) {
    console.debug(`CI env var is present`);
  } else {
    console.debug(`CI env var is not present -- presuming dev mode`);
  }

  if (!isCI) {
    let { devBrowser } = config;

    let { url } = await config.launch();

    // await new Promise(resolve => setTimeout(resolve, 50_000));

    return await launchBrowser(devBrowser, config, url);
  }
}

/**
 * @param {string} browserName
 * @param {import('../types').Config} config
 * @param {string} urlString
 */
async function launchBrowser(browserName, config, urlString) {
  let { browsers } = config;
  let browserConfig = browsers[browserName];
  let defaultConfig = DEFAULT_LAUNCHERS[browserName];

  console.debug(urlString);

  let url = new URL(urlString);

  assert(
    browserConfig,
    `config for browser, ${browserName}, was not found. Available: ${Object.keys(browsers)} `
  );
  assert(
    defaultConfig,
    `defalt config for browser, ${browserName}, was not found. Available: ${Object.keys(browsers)} `
  );

  let launcher = defaultConfig(url, browserConfig.args);

  await launcher.initialize({});
  await launcher.startSession(1, urlString);

  process.on('exit', () => launcher.stop());
}

async function getConfig() {
  let existingPath;

  for (let ext of MJS_EXT) {
    let configPath = path.join(CWD, CONFIG_NAME + ext);
    let doesExist = await fse.pathExists(configPath);

    if (doesExist) {
      existingPath = configPath;

      break;
    }
  }

  assert(
    existingPath,
    `Could not find config file. Expected either ${CONFIG_NAME}.js or ${CONFIG_NAME}.mjs in the ${CWD} directory. Note that this file must be a module.`
  );

  let configModule = await import(existingPath);

  return configModule.default;
}
