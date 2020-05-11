// @ts-check

/** @type{import('au').AuConfigurationOptions} */
module.exports = {
  server: {
    root: './dist/',
    port: 443,
    useHttp2: true,
    useHttps: true,
    key: './ssl/key.pem',
    cert: './ssl/cert.pem'
  }
};
