const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { startServer } = require('../server.js');

function getFreePort() {
  return new Promise((resolve, reject) => {
    const probe = http.createServer();
    probe.listen(0, '0.0.0.0', () => {
      const { port } = probe.address();
      probe.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
    probe.on('error', reject);
  });
}

test('server should pick the next available port when the requested port is busy', async () => {
  const startPort = await getFreePort();
  const blocker = http.createServer();

  await new Promise((resolve) => blocker.listen(startPort, '0.0.0.0', resolve));

  try {
    const server = await startServer(startPort);
    const port = server.address().port;

    assert.ok(port > startPort, `Expected fallback port > ${startPort} but got ${port}`);

    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  } finally {
    await new Promise((resolve, reject) => {
      blocker.close((err) => (err ? reject(err) : resolve()));
    });
  }
});
