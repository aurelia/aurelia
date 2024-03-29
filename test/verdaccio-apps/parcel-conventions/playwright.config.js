module.exports = {
  // Forbid test.only on CI
  forbidOnly: !!process.env.CI,
  // Limit the number of workers on CI, use default locally
  workers: process.env.CI ? 3 : undefined,

  // webServer: {
  //   command: `cross-env APP_PORT=${port} npm run dev`,
  //   port: port,
  // }
  use: {
    baseURL: 'http://localhost:8080',
  }
};
