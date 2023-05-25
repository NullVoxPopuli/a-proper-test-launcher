// @ts-nocheck
import { launch } from '../launchers/browser-launcher.js';


let [, , ...args] = process.argv;

/**
  * !(dev || serve) means headless testem
  */
launch({
  /**
  * Launch vite with tests only
  */
  dev: args.includes('dev'),
  /**
  * Testem server
  */
  serve: args.includes('serve'),
});
