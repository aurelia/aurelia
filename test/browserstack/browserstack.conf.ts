// http://webdriver.io/guide/testrunner/configurationfile.html
import * as browserstack from 'browserstack-local';
import { CIEnv } from '../../scripts/ci-env';

declare const browser: any;

const build = `e2e_${Date.now()}`;

/* eslint-disable @typescript-eslint/camelcase */
function combine(browsers, oses) {
  const capabilities = [];
  for (const { versions: browser_versions, name: browserName } of browsers) {
    for (const browser_version of browser_versions) {
      for (const { versions: os_versions, name: os } of oses) {
        for (const os_version of os_versions) {
          capabilities.push({
            'browser': browserName,
            browserName,
            browser_version,
            'browserVersion': browser_version,
            'version': browser_version,
            os,
            'platform': os,
            'platformName': os,
            'platformVersion': os_version,
            os_version,
            'project': 'Aurelia vNext',
            'name': `${CIEnv.CIRCLE_PROJECT_REPONAME}_${CIEnv.CIRCLE_BRANCH}`,
            'build': `${CIEnv.CIRCLE_JOB}_${CIEnv.CIRCLE_BUILD_NUM}`,
            'browserstack.local': 'true',
            'browserstack.opts':  {
              localIdentifier: build,
            },
            'browserstack.debug': 'true',
            'browserstack.console': 'info',
            'browserstack.networkLogs': 'true',
            'browserstack.video': 'false',
            'browserstack.timezone': 'UTC',
          });
        }
      }
    }
  }
  return capabilities;
}
/* eslint-enable @typescript-eslint/camelcase */

exports.config = {
  user: CIEnv.BS_USER,
  key: CIEnv.BS_KEY,

  restart: false,

  updateJob: true,
  specs: [
    'dist/specs/**/*.spec.js'
  ],
  exclude: [],

  maxInstances: 5,

  capabilities: [
    ...combine([
      // { versions: ['17'], name: 'Edge' },
      { versions: ['71'], name: 'Chrome' },
      // { versions: ['65'], name: 'Firefox' }
    ], [
      { versions: ['10'], name: 'WINDOWS' },
      // { versions: ['High Sierra'], name: 'OS X' }
    ]),
    // ...combine([
    //   { versions: ['17'], name: 'Edge' },
    // ], [
    //   { versions: ['10'], name: 'Windows' }
    // ]),
    // ...combine([
    //   { versions: ['11.1'], name: 'Safari' },
    //   { versions: ['10.1'], name: 'Safari' }
    // ], [
    //   { versions: ['High Sierra'], name: 'OS X' },
    //   { versions: ['Sierra'], name: 'OS X' }
    // ])
  ],

  logLevel: 'silent',
  coloredLogs: true,
  screenshotPath: './errorShots/',
  baseUrl: `http://${CIEnv.APP_HOST}:${CIEnv.APP_PORT}`,
  waitforTimeout: 30000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  host: 'hub.browserstack.com',

  reporters: ['spec'],

  framework: 'mocha',
  mochaOpts: {
    timeout: 60000,
    ui: 'bdd',
    colors: true
  },

  /**
   * Gets executed once before all workers get launched.
   *
   * @param {Object} config - wdio configuration object
   * @param {Array.<Object>} capabilities - list of capabilities details
   */
  onPrepare: function (config, capabilities) {
    console.log('Connecting local');
    return new Promise(function(resolve, reject){
      // eslint-disable-next-line @typescript-eslint/camelcase
      exports.bs_local = new browserstack.Local();
      exports.bs_local.start({'key': exports.config.key }, function(error) {
        if (error) return reject(error);
        console.log('Connected. Now testing...');

        resolve();
      });
    });
  },
  /**
   * Gets executed just before initialising the webdriver session and test framework. It allows you
   * to manipulate configurations depending on the capability or spec.
   *
   * @param {Object} config - wdio configuration object
   * @param {Array.<Object>} capabilities - list of capabilities details
   * @param {Array.<String>} specs - List of spec file paths that are to be run
   */
  beforeSession: function (config, capabilities, specs) {
    return;
  },
  /**
   * Gets executed before test execution begins. At this point you can access to all global
   * variables like `browser`. It is the perfect place to define custom commands.
   *
   * @param {Array.<Object>} capabilities - list of capabilities details
   * @param {Array.<String>} specs - List of spec file paths that are to be run
   */
  before: function (capabilities, specs) {
    return;
  },
  /**
   * Hook that gets executed before the suite starts
   *
   * @param {Object} suite - suite details
   */
  beforeSuite: function (suite) {
    return;
  },
  /**
   * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
   * beforeEach in Mocha)
   */
  beforeHook: function () {
    return;
  },
  /**
   * Hook that gets executed _after_ a hook within the suite ends (e.g. runs after calling
   * afterEach in Mocha)
   */
  afterHook: function () {
    return;
  },
  /**
   * Function to be executed before a test (in Mocha/Jasmine) or a step (in Cucumber) starts.
   *
   * @param {Object} test - test details
   */
  beforeTest: function (test) {
    return;
  },
  /**
   * Runs before a WebdriverIO command gets executed.
   *
   * @param {String} commandName - hook command name
   * @param {Array} args - arguments that command would receive
   */
  beforeCommand: function (commandName, args) {
    return;
  },
  /**
   * Runs after a WebdriverIO command gets executed
   *
   * @param {String} commandName - hook command name
   * @param {Array} args - arguments that command would receive
   * @param {Number} result - 0 - command success, 1 - command error
   * @param {Object} error - error object if any
   */
  afterCommand: function (commandName, args, result, error) {
    if (result) {
      const { state, status } = result;
      if (state === 'failure' || status === 'failure' || state === 1 || status === 1) {
        console.log(`Error - marking session ${browser.sessionId} as failed - ${error}`);
        CIEnv.browserstackPut(`sessions/${browser.sessionId}.json`, { status: 'failed', reason: error });
      }
    }
  },
  /**
   * Function to be executed after a test (in Mocha/Jasmine) or a step (in Cucumber) ends.
   *
   * @param {Object} test - test details
   */
  afterTest: function (test) {
    return;
  },
  /**
   * Hook that gets executed after the suite has ended
   *
   * @param {Object} suite - suite details
   */
  afterSuite: function (suite) {
    return;
  },
  /**
   * Gets executed after all tests are done. You still have access to all global variables from
   * the test.
   *
   * @param {Number} result - 0 - test pass, 1 - test fail
   * @param {Array.<Object>} capabilities - list of capabilities details
   * @param {Array.<String>} specs - List of spec file paths that ran
   */
  after: function (result, capabilities, specs) {
    if (result > 0) {
      console.log(`Error - marking session ${browser.sessionId} as failed - code ${result}`);
      CIEnv.browserstackPut(`sessions/${browser.sessionId}.json`, { status: 'failed', reason: `code ${result}` });
    }
  },
  /**
   * Gets executed right after terminating the webdriver session.
   *
   * @param {Object} config - wdio configuration object
   * @param {Array.<Object>} capabilities - list of capabilities details
   * @param {Array.<String>} specs - List of spec file paths that ran
   */
  afterSession: function (config, capabilities, specs) {
    return;
  },
  /**
   * Gets executed after all workers got shut down and the process is about to exit.
   *
   * @param {Object} exitCode - 0 - success, 1 - fail
   * @param {Object} config - wdio configuration object
   * @param {Array.<Object>} capabilities - list of capabilities details
   */
  onComplete: function (exitCode, config, capabilities) {
    console.log(`onComplete, exitCode: ${exitCode}`);
    exports.bs_local.stop(function () { return; });
  },
  /**
   * Gets executed when an error happens, good place to take a screenshot
   * @ {String} error message
   */
  onError: function(message) {
    console.log(`Error - marking session ${browser.sessionId} as failed - ${message}`);
    CIEnv.browserstackPut(`sessions/${browser.sessionId}.json`, { status: 'failed', reason: message });
  }
};
