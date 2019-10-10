const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

(function () {
  async function handleRequest(req, res) {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
      });
      res.end();
    } else if (req.method === 'GET') {
      const parsedUrl = url.parse(req.url);
      let relativePath = parsedUrl.path;

      if (relativePath && relativePath.startsWith('/')) {
        relativePath = relativePath.slice(1);
      }

      if (!relativePath || relativePath === '/') {
        relativePath += 'index.html';
      }

      if (!relativePath.includes('.')) {
        relativePath += '/index.html';
      }

      let mimeType;
      switch (relativePath.split('.').pop()) {
        case 'html':
          mimeType = 'text/html';
          break;
        case 'css':
          mimeType = 'text/css';
          break;
        case 'js':
          mimeType = 'text/javascript';
          break;
        default:
          mimeType = 'text/plain';
      }

      const filePath = path.resolve(__dirname, relativePath);
      try {
        const buffer = await fs.promises.readFile(filePath);
        res.writeHead(200, {
          'Content-Type': mimeType,
        });
        res.end(buffer, 'utf8');
      } catch {
        res.writeHead(404, {
          'Content-Type': mimeType,
        });
        res.end();
      }
    }
  }

  const server = http.createServer(handleRequest);

  server.listen(8080, '0.0.0.0');
})();
