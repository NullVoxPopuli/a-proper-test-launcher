// @ts-check

/**
 * @typedef {import('vite').ViteDevServer['ws']} WebSocketServer
 * @typedef {Parameters<WebSocketServer['on']>[1]} Handler
 */

import { NAME } from '../shared.js';

// TODO: use a TAP Reporter

/**
 * @param {WebSocketServer} ws
 */
export function handleProgress(ws) {
  on(ws, 'start', (data) => {
    console.debug('TODO', data);
  });
  on(ws, 'finish', (data) => {
    console.debug('TODO', data);
  });
  on(ws, 'suite:start', (data) => {
    console.debug('TODO', data);
  });
  on(ws, 'suite:finish', (data) => {
    console.debug('TODO', data);
  });
  on(ws, 'test:start', (data) => {
    console.debug('TODO', data);
  });
  on(ws, 'test:finish', (data) => {
    console.debug('TODO', data);
  });
}

/**
 * @param {WebSocketServer} ws
 * @param {import('../types.js').EventName} eventName
 * @param {Handler} handler
 */
function on(ws, eventName, handler) {
  ws.on(`${NAME}:${eventName}`, handler);
}
