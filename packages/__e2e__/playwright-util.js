/** @type {(pkg: { port?: number }, workers?: number, ) => import('@playwright/test').PlaywrightTestConfig} */
module.exports = function getPlaywrightConfig(pkg, workers) {
  return {
    // Forbid test.only on CI
    forbidOnly: !!process.env.CI,
    // Limit the number of workers on CI, use default locally
    workers: process.env.CI ? 3 : workers,
    retries: process.env.CI ? 1 : 0,

    // webServer: {
    //   command: `cross-env APP_PORT=${port} npm run dev`,
    //   port: port,
    //   use
    // },
    use: {
      headless: true,
      baseURL: `http://localhost:` + (pkg.port ?? defaultVitePort),
    },
    expect: {
      timeout: 10_000,
    },
  }
};

const defaultVitePort = 5173;
