export type Config = {
  devServer?: 'vite';
  devBrowser?: string;
  browsers: Record<
    'chrome' | 'firefox' | 'edge' | string,
    {
      args: string[];
    }
  >;
};

export type EventName =
  | 'start'
  | 'finish'
  | 'suite:start'
  | 'suite:finish'
  | 'test:start'
  | 'test:finish';

interface Payloads {
  start: {
    suites: number;
    tests: number;
  };
  finish: {
    /**
     * How long all of thests took to finish.
     * Measured in milliseconds.
     */
    duration: number;

    failedTests: number;
    passingTests: number;
    failedAssertions: number;
    passingAssertions: number;
  };
  'suite:start': {
    suiteName: string;
  };
  'suite:finish': {
    suiteName: string;
  };
  'test:start': {
    suiteName: string;
    name: string;
  };
  'test:finish': {
    suiteName: string;
    name: string;
    duration: number;

    passingAssertions: number;
    failingAssertions: number;
    isSkipped: number;
  };
}

export type Data<Event extends EventName> = Payloads[Event];

export type ReportMethod = <Event extends EventName>(eventName: Event, data: Data<Event>) => void;
