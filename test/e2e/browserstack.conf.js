//http://webdriver.io/guide/testrunner/configurationfile.html

const os = require('os');
const browserstack = require('browserstack-local');

function combine(browsers, oses) {
  const capabilities = [];
  for (const { versions: browser_versions, name: browserName } of browsers) {
    for (const browser_version of browser_versions) {
      for (const { versions: os_versions, name: os } of oses) {
        for (const os_version of os_versions) {
          capabilities.push({
            browserName,
            browser_version,
            os,
            os_version
          });
        }
      }
    }
  }
  return capabilities;
}

function BS_USER() {
  if (!!process.env.BS_USER) {
    return process.env.BS_USER;
  }
  throw new Error('BrowserStack username must be set to the BS_USER env variable');
}
function BS_KEY() {
  if (!!process.env.BS_KEY) {
    return process.env.BS_KEY;
  }
  throw new Error('BrowserStack key must be set to the BS_KEY env variable');
}

function APP_PORT() {
  const val = process.env.APP_PORT || '9000';
  console.log(`APP_PORT: ${val}`);
  return val;
}

function APP_HOST() {
  let val = process.env.APP_HOST;
  if (!val) {
    const nics = os.networkInterfaces();
    outer: for (const name in nics) {
      for (const nic of nics[name]) {
        if (nic.family !== 'IPv4' || nic.internal !== false) {
          continue;
        }
        val = nic.address;
        break outer;
      }
    }
  }
  console.log(`APP_HOST: ${val}`);
  return val;
}

const build = `e2e_${Date.now()}`

exports.config = {
  user: BS_USER(),
  key: BS_KEY(),

  updateJob: false,
  specs: ['dist/**/*.spec.js'],
  exclude: [],

  maxInstances: 5,
  commonCapabilities: {
    'name': `${process.env.CIRCLE_PROJECT_REPONAME}_${process.env.CIRCLE_BRANCH}`,
    'build': `${process.env.CIRCLE_JOB}_${process.env.CIRCLE_BUILD_NUM}`,
    'browserstack.local': true,
    'browserstack.opts':  {
      localIdentifier: build,
    },
    'browserstack.debug': true,
    'browserstack.console': 'verbose',
    'browserstack.networkLogs': true,
    'browserstack.timezone': 'UTC',
  },

  // TODO: make this more explicitly configurable and flexible
  capabilities: process.env.CIRCLE_BRANCH	=== 'master' && process.env.CIRCLE_JOB !== 'publish_nightly' ? [
    ...combine([
      { versions: ['68', '67', '66'], name: 'Chrome' },
      { versions: ['61', '60', '59'], name: 'Firefox' }
    ], [
      { versions: ['10', '8.1', '8', '7'], name: 'Windows' },
      { versions: ['High Sierra', 'Sierra', 'El Capitan', 'Yosemite'], name: 'OS X' }
    ]),
    ...combine([
      { versions: ['12.15', '12.16'], name: 'Opera' },
    ], [
      { versions: ['8.1', '8', '7'], name: 'Windows' }
    ]),
    ...combine([
      { versions: ['11'], name: 'IE' },
    ], [
      { versions: ['10', '8.1', '7'], name: 'Windows' }
    ]),
    ...combine([
      { versions: ['10'], name: 'IE' },
    ], [
      { versions: ['8', '7'], name: 'Windows' }
    ]),
    ...combine([
      { versions: ['17', '16', '15'], name: 'Edge' },
    ], [
      { versions: ['10'], name: 'Windows' }
    ]),
    ...combine([
      { versions: ['11.1'], name: 'Safari' },
    ], [
      { versions: ['High Sierra'], name: 'OS X' }
    ]),
    ...combine([
      { versions: ['10.1'], name: 'Safari' },
    ], [
      { versions: ['Sierra'], name: 'OS X' }
    ]),
    ...combine([
      { versions: ['9.1'], name: 'Safari' },
    ], [
      { versions: ['El Capitan'], name: 'OS X' }
    ]),
    ...combine([
      { versions: ['8'], name: 'Safari' },
    ], [
      { versions: ['Yosemite'], name: 'OS X' }
    ])
  ] : [
    ...combine([
      { versions: ['68'], name: 'Chrome' },
      { versions: ['61'], name: 'Firefox' }
    ], [
      { versions: ['10'], name: 'Windows' },
      { versions: ['High Sierra'], name: 'OS X' }
    ]),
    ...combine([
      { versions: ['17'], name: 'Edge' },
    ], [
      { versions: ['10'], name: 'Windows' }
    ]),
    ...combine([
      { versions: ['11.1'], name: 'Safari' },
    ], [
      { versions: ['High Sierra'], name: 'OS X' }
    ])
  ],

  logLevel: 'silent',
  coloredLogs: true,
  screenshotPath: './errorShots/',
  baseUrl: `http://${APP_HOST()}:${APP_PORT()}`,
  waitforTimeout: 30000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  host: 'hub.browserstack.com',

  reporters: ['dot', 'allure'],
  reporterOptions: {
      allure: {
          outputDir: 'allure-results'
      }
  },

  framework: 'mocha',
  mochaOpts: {
      timeout: 60000,
      ui: 'bdd',
      useColors: true,
      recursive: true
  },


    /**
     * Gets executed once before all workers get launched.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     */
    onPrepare: function (config, capabilities) {
      console.log("Connecting local");
      return new Promise(function(resolve, reject){
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
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     */
    beforeSession: function (config, capabilities, specs) {
    },
    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`. It is the perfect place to define custom commands.
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     */
    before: function (capabilities, specs) {
    },
    /**
     * Hook that gets executed before the suite starts
     * @param {Object} suite suite details
     */
    beforeSuite: function (suite) {
    },
    /**
     * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
     * beforeEach in Mocha)
     */
    beforeHook: function () {
    },
    /**
     * Hook that gets executed _after_ a hook within the suite ends (e.g. runs after calling
     * afterEach in Mocha)
     */
    afterHook: function () {
    },
    /**
     * Function to be executed before a test (in Mocha/Jasmine) or a step (in Cucumber) starts.
     * @param {Object} test test details
     */
    beforeTest: function (test) {
    },
    /**
     * Runs before a WebdriverIO command gets executed.
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     */
    beforeCommand: function (commandName, args) {
    },
    /**
     * Runs after a WebdriverIO command gets executed
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     * @param {Number} result 0 - command success, 1 - command error
     * @param {Object} error error object if any
     */
    afterCommand: function (commandName, args, result, error) {
    },
    /**
     * Function to be executed after a test (in Mocha/Jasmine) or a step (in Cucumber) ends.
     * @param {Object} test test details
     */
    afterTest: function (test) {
    },
    /**
     * Hook that gets executed after the suite has ended
     * @param {Object} suite suite details
     */
    afterSuite: function (suite) {
    },
    /**
     * Gets executed after all tests are done. You still have access to all global variables from
     * the test.
     * @param {Number} result 0 - test pass, 1 - test fail
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    after: function (result, capabilities, specs) {
    },
    /**
     * Gets executed right after terminating the webdriver session.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    afterSession: function (config, capabilities, specs) {
    },
    /**
     * Gets executed after all workers got shut down and the process is about to exit.
     * @param {Object} exitCode 0 - success, 1 - fail
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     */
    onComplete: function (exitCode, config, capabilities) {
      exports.bs_local.stop(function() {});
    },
    /**
    * Gets executed when an error happens, good place to take a screenshot
    * @ {String} error message
    */
    onError: function(message) {
    }
}

// Code to support common capabilities
exports.config.capabilities.forEach(function(caps){
  for(var i in exports.config.commonCapabilities) caps[i] = caps[i] || exports.config.commonCapabilities[i];
});
