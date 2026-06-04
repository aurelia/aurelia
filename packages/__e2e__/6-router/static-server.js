const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PROD_PORT || '9007', 10);
const DIST_DIR = path.resolve(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // Parse URL and strip leading slashes to prevent path traversal
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const relativePath = url.pathname.replace(/^\/+/, '') || 'index.html';

  // Resolve against DIST_DIR and validate it stays within bounds
  const filePath = path.resolve(DIST_DIR, relativePath);

  // Security check: ensure resolved path is within DIST_DIR
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Handle client-side routing - serve index.html for non-file paths
  const ext = path.extname(filePath);
  const targetPath = ext ? filePath : path.join(DIST_DIR, 'index.html');

  fs.readFile(targetPath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found - serve index.html for SPA routing
        fs.readFile(path.join(DIST_DIR, 'index.html'), (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading index.html');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
    } else {
      const contentType = MIME_TYPES[path.extname(targetPath)] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Static server running at http://localhost:${PORT}/`);
});

// Graceful shutdown
const shutdown = () => {
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
