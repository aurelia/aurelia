// A mini dev server.
// Uses standard Nodejs http or https server.
// Uses "connect" for various middlewares.
// Uses "socket.io" for live-reload in watch mode.
// Uses "open" to automatically open user browser.
const connect = require('connect');
const _open = require('open');
const serveStatic = require('serve-static');
const http = require('http');
const _https = require('https');
const historyApiFallback = require('connect-history-api-fallback');
const injector = require('connect-injector');
const socketIO = require('socket.io');

// Use dedicated path for the dev server socket.io.
// In order to avoid possible conflict with user app socket.io.
const socketIOPath = '/__dev_socket.io';
// Tell user browser to reload.
const socketIOSnippet = `
<script src="${socketIOPath}/socket.io.js"></script>
<script>
  var socket = io({path: '${socketIOPath}'});
  socket.on('reload', function() {
    console.log('Reload the page');
    window.location.reload();
  });
</script>
`;
let io;

exports.run = function({
  port = 9000,
  https = false,
  open = false // automatically open a browser window
} = {}) {
  const app = connect()
    // Inject socket.io snippet for live-reload.
    // Note connect-injector is a special middleware,
    // has to be applied before all other middlewares.
    .use(injector(
      (req, res) => {
        const contentType = res.getHeader('content-type');
        return contentType && (contentType.toLowerCase().indexOf('text/html') >= 0);
      },
      (content, req, res, callback) => {
        const injected = content.toString().replace(/<\/head>/i, socketIOSnippet + '\n</head>');
        callback(null, injected);
      }
    ))
    // connect-history-api-fallback is a tool to help SPA dev.
    // So in dev mode, http://localhost:port/some/route will get
    // the same /index.html as content, instead of 404 at /some/route.html
    .use(historyApiFallback())
    .use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
    })
    .use(serveStatic('.'));

  const server = https ?
    _https.createServer({key: localKey, cert: localCert}, app) :
    http.createServer(app);
  io = socketIO(server, {path: socketIOPath});
  server.listen(port);
  const url = `http${https ? 's' : ''}://localhost:${port}`;
  console.log(`\x1b[36m\nDev server is started at: ${url}\n\x1b[0m`);
  if (open) _open(url);
};

exports.reload = function() {
  io && io.emit('reload');
};

// An example of self-signed certificate.
// Expires: Tuesday, 29 January 2030
const localCert = `-----BEGIN CERTIFICATE-----
MIICpDCCAYwCCQDn7uXANbZ/wzANBgkqhkiG9w0BAQsFADAUMRIwEAYDVQQDDAls
b2NhbGhvc3QwHhcNMjAwMjAxMDA1ODQ3WhcNMzAwMTI5MDA1ODQ3WjAUMRIwEAYD
VQQDDAlsb2NhbGhvc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC+
X/5JbY8atUrS+0nfWA/tNHHaf0W9HKwyjC74Fv2xawQOFamSUELfjHhsauVfrPqb
ONxZFAMC8GP4eRrJ8pMapN6HrIJRKMjHgImC4mOyCr7up9MqAVjvVRrrcP//XLdf
ksw70LI0In7tzu7tazKP9Ix7VBbaPBV7YKY/0b7t/m8/0elRrrnUA9xWgFadYYGy
ecgR7mvDDOIH9jzvbVr6tkhxnizlyRdpUuHcdVYGoJ97gJkm7d41Z3ICt9miKgCQ
QyhOKDsDRiXMCUH4EEOYqljJqSnMi5tGgGdB11Pz64f0oIzdTPWOONLtYlzC+h7u
gK199HtIReK7J/AZpdHpAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAF5gqaldwOBj
eD23Xy0r87O4ddxIhlSYlfVFdx+9w4YXNg0rnAbBv2BEZtSIyoH9E3Uc+OKT/63b
GsICR/21Rwz40SIBSTEutWlcp7G1cpqkel3X7fE3n/t5heJjG5QjCsu8R3FOMm/r
JDwsJvooflTpHEYKERYOvmMpxWpwqA0uSRSJnFkD7w/PCNO0nwXFRZSUEyf80sa/
4kW3wgcPbsFfjKhR+dMNExHCvXojQW5DIQB1+SVXPH+ovmVWBtuqfFRhg6ZpGZIz
U6CkaUFtibCZy/PkE0b9NxfTZzbwGE6FuJIvxFuiFw+h2585aAe3/NvLE14jezTM
YeaOL55+27w=
-----END CERTIFICATE-----
`;

const localKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAvl/+SW2PGrVK0vtJ31gP7TRx2n9FvRysMowu+Bb9sWsEDhWp
klBC34x4bGrlX6z6mzjcWRQDAvBj+HkayfKTGqTeh6yCUSjIx4CJguJjsgq+7qfT
KgFY71Ua63D//1y3X5LMO9CyNCJ+7c7u7Wsyj/SMe1QW2jwVe2CmP9G+7f5vP9Hp
Ua651APcVoBWnWGBsnnIEe5rwwziB/Y8721a+rZIcZ4s5ckXaVLh3HVWBqCfe4CZ
Ju3eNWdyArfZoioAkEMoTig7A0YlzAlB+BBDmKpYyakpzIubRoBnQddT8+uH9KCM
3Uz1jjjS7WJcwvoe7oCtffR7SEXiuyfwGaXR6QIDAQABAoIBADMVqzSk84ulLkjj
KXWHOe7a7dpF4L7YXNTLjScBdF4Ra2skIPakFu3J0d616Ir97dmNLoOwvQYi35Cj
Xq7mKtcxeo1Jm0aP/SCbu0ql2T7DZ2y/GAjjh6vhWHHpRqiNhp9c0vUSEV+wCgNi
TfbjlxPN+Yx2ihNRoCoVS0dAz00pTLBo0W63bPf1WMB9K2TYRpVG+4X/HtFYL77x
isQjAEF7Av2tLPwgp3RX7eeV1ojXdTPrCMEsoyZBaEUjdtuGkP/J5vaF75IWCgIN
4sdcYKemVeZB7JHie1/LxjNLnXFDDSL6Qb6ps15nMW73+/IoHPZ+KJK42gWcoOGF
AgnUUUkCgYEA53Qjjw/zwP5CWIXgoNgYkg2XpxZ9Hx6GNhfaMnMOKIrA5m9MAkEH
Z7WIwxHFfQNLvtBNGuMPBgNyWKBoF1rsP/WH8aEUGvRJHnqSiBIvhPO6uJ2hQaJg
cvPIDoit5Vu4O4tYUbZI2bn2yH13oUyJ6OK58+87+Nb2jT9c4TiEZ4MCgYEA0pCW
MLBLCHL3oKtb57N4ztbKiOe5FTPl8jPtM13dHBIa/cnWVbajTB4fghtdoLnCqoaS
e43yDhn1liE+1/uj72Kz5R8TgzEOuoOSFM2UdzKtkom493PP1mRgKP1g+I2nZksS
EYGCua8hHXm1LZ3qiDnn3sgVdb38pI4i/THquSMCgYEAjaahgJPlvW6e0iiVMjsu
xmw1LRhxWRNIVmDAtHF/78YDisQAw7xiuND8M050DC9xMwWuus7NygNf/uek7O5D
el1dZr8LW/e3rESd21Mt6/NyijxGjbG/z3ptLJ/vtVgt55s/YTrrWP0cENXg2kHK
gVIJNkZq8L82w3lM8bWyKtsCgYEAv3A1HI8rqMLd4HXrWP0TGPqvqUkEPQKyTUJo
pgrwvFS5tYOMGuGyFcJNYzz+IuLA2cj/5NVo/OkdHyGawUNICJz0cZuPYfd4LJry
dXdzQ+wPYutT/6aLj6AyzRGQ2GnxiE84XjIhaDCRKvs8ffzU/oWnCiVfXW0eBX40
0X5QqYECgYA9rTtNkcPSc/DQ2MAYqY+gQFT1KJ5iu3xpsJCsda1iA3H+CJgy6ewp
T5wCqfxtcUza62Pa+hwhP4DewAbCosedAhNb7UOqwYXjMR5262ecNqhL3biguD0i
YaFo2iRA3JVA7Nd6a/Q4JbDXJWeKxR+LD35etO20vrqz2jj61pfClw==
-----END RSA PRIVATE KEY-----
`;
