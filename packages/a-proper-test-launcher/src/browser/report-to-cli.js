// @ts-check

import { NAME } from '../shared.js';

class ProgressReporter {
  static create() {
    let instance = new ProgressReporter();

    return instance;
  }

  /** @type {import('../types.js').ReportMethod} */
  report = (eventName, data) => {
    if (!import.meta.hot) {
      throw new Error(`vite hmr / "hot" mode is required`);
    }

    // TODO: write or find a runtime way to check the type
    /** @type {any} */
    let technicallyUnknown = data;

    // https://vitejs.dev/guide/api-plugin.html#client-to-server
    import.meta.hot.send(`${NAME}:${eventName}`, technicallyUnknown);
  };
}

// Does this need options?
export const progress = ProgressReporter.create();
