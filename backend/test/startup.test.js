const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

test('importing the application opens no listener, timer or database connection and exits naturally', () => {
  const result = spawnSync(process.execPath, ['-e', `
    const assert = require('node:assert/strict');
    const net = require('node:net');
    net.Server.prototype.listen = () => { throw new Error('Unexpected listener'); };
    net.Socket.prototype.connect = () => { throw new Error('Unexpected connection'); };
    global.setInterval = () => { throw new Error('Unexpected timer'); };
    const app = require('./index');
    assert.equal(typeof app.listen, 'function');
    assert.equal(typeof app.startServer, 'function');
  `], { cwd: path.join(__dirname,'..'), encoding:'utf8', timeout:10000, windowsHide:true });
  assert.ifError(result.error);
  assert.equal(result.status,0,result.stderr);
});

test('explicit startup prepares the database before listening and closes its timer, socket and pool', () => {
  const result = spawnSync(process.execPath, ['-e', `
    const assert = require('node:assert/strict');
    const events = [];
    const stub = (name, exports) => { require.cache[require.resolve(name)] = { exports }; };
    stub('./config/db', { end: async () => events.push('end') });
    stub('./database/migrate', async () => events.push('migrate'));
    stub('./services/membershipService', { syncMemberships: async () => events.push('sync') });
    let timer;
    const originalInterval = global.setInterval;
    global.setInterval = (...args) => { timer = originalInterval(...args); return timer; };
    process.env.PORT = '0';
    const app = require('./index');
    const listen = app.listen.bind(app);
    app.listen = (...args) => { events.push('listen'); return listen(...args); };
    (async () => {
      const signals = process.listenerCount('SIGTERM');
      const { server, stop } = await app.startServer();
      assert.deepEqual(events, ['migrate','sync','listen']);
      assert.ok(server.listening);
      assert.equal(process.listenerCount('SIGTERM'), signals + 1);
      await Promise.all([stop(), stop()]);
      assert.equal(server.listening, false);
      assert.equal(timer._destroyed, true);
      assert.equal(process.listenerCount('SIGTERM'), signals);
      assert.deepEqual(events, ['migrate','sync','listen','end']);
    })().catch(error => { console.error(error); process.exitCode = 1; });
  `], { cwd: path.join(__dirname,'..'), encoding:'utf8', timeout:10000, windowsHide:true });
  assert.ifError(result.error);
  assert.equal(result.status,0,result.stderr);
});
