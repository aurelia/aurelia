// @ts-check
const pkg = require('../package.json');

module.exports = async function globalSetup() {
  const { preview } = await import('vite');
  const server = await preview({
    preview: {
      host: '127.0.0.1',
      port: pkg.port,
      strictPort: true,
    },
  });

  return async () => {
    await new Promise((resolve, reject) => {
      server.httpServer.close(error => error == null ? resolve(undefined) : reject(error));
    });
  };
};
