const http = require('http');
const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = 3000;
const MAX_PORT_ATTEMPTS = 10;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function createServer() {
  return http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';

    const safePath = path.normalize(path.join(__dirname, reqUrl));
    if (!safePath.startsWith(__dirname)) {
      res.writeHead(403);
      res.end('Access Denied');
      return;
    }

    fs.readFile(safePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      const ext = path.extname(safePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
}

function startServer(port = DEFAULT_PORT, attempts = 0) {
  const server = createServer();

  return new Promise((resolve, reject) => {
    const onError = (error) => {
      if (error && error.code === 'EADDRINUSE') {
        if (attempts >= MAX_PORT_ATTEMPTS) {
          reject(error);
          return;
        }

        const nextPort = port + 1;
        console.warn(`Port ${port} is busy. Retrying on ${nextPort}...`);
        resolve(startServer(nextPort, attempts + 1));
        return;
      }

      reject(error);
    };

    server.once('error', onError);
    server.listen(port, '0.0.0.0', () => {
      server.removeListener('error', onError);
      console.log(`TypeArcade server running at: http://localhost:${port}`);
      resolve(server);
    });
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`Unable to start TypeArcade server: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  DEFAULT_PORT,
  MAX_PORT_ATTEMPTS,
  startServer
};
