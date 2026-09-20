const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const os = require('node:os');
const nodemailer = require('nodemailer');
const { sendTemporaryPasswordEmail, verifyEmailConnection } = require('../utils/emailService');

const keys = ['GMAIL_USER', 'GMAIL_APP_PASSWORD', 'SMTP_FROM', 'SMTP_PASS'];
let previous;
beforeEach(() => {
  previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  process.env.GMAIL_USER = 'gym@example.invalid';
  process.env.GMAIL_APP_PASSWORD = 'test-only-password';
  process.env.SMTP_FROM = 'Test Gym <gym@example.invalid>';
});
afterEach(() => {
  for (const key of keys) {
    if (previous[key] === undefined) delete process.env[key];
    else process.env[key] = previous[key];
  }
});

test('the same backend/.env is loaded outside the project and overrides inherited credentials', () => {
  const script = `
    const fs = require('node:fs');
    const dotenv = require(${JSON.stringify(require.resolve('dotenv'))});
    const { envFile } = require(${JSON.stringify(require.resolve('../config/env'))});
    const expected = dotenv.parse(fs.readFileSync(envFile));
    const keys = ['DB_NAME','DB_PASSWORD','GMAIL_USER','GMAIL_APP_PASSWORD','SMTP_FROM'];
    if (!keys.every(key => process.env[key] === expected[key])) process.exit(1);
    if (process.env.DB_SSL !== expected.DB_SSL) process.exit(2);
  `;
  const result = spawnSync(process.execPath, ['-e', script], {
    cwd: os.tmpdir(),
    windowsHide: true,
    env: { ...process.env, DB_NAME: 'wrong-database', DB_PASSWORD: 'wrong-password', DB_SSL: 'wrong-setting' },
    encoding: 'utf8',
    timeout: 10000,
  });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});

test('missing Gmail settings never fall back to SMTP_PASS or send a message', async t => {
  process.env.GMAIL_APP_PASSWORD = '';
  process.env.SMTP_PASS = 'another-project-password';
  const transport = t.mock.method(nodemailer, 'createTransport', () => { throw new Error('Unexpected SMTP connection'); });
  const result = await sendTemporaryPasswordEmail({ to: 'client@example.invalid', nombre: 'Client', temporaryPassword: 'Temporary123!' });
  assert.equal(result.sent, false);
  assert.equal(result.code, 'EMAIL_CONFIG');
  assert.match(result.reason, /GMAIL_APP_PASSWORD/);
  assert.equal(transport.mock.callCount(), 0);
});

test('credentials are sent to the requested recipient with the configured sender and escaped HTML', async t => {
  let delivered;
  t.mock.method(nodemailer, 'createTransport', options => {
    assert.equal(options.auth.user, 'gym@example.invalid');
    return { sendMail: async message => { delivered = message; return { accepted: [message.to] }; }, close() {} };
  });
  const result = await sendTemporaryPasswordEmail({ to: 'client@example.invalid', nombre: '<Cliente>', temporaryPassword: 'Password<&123' });
  assert.equal(result.sent, true);
  assert.equal(delivered.to, 'client@example.invalid');
  assert.equal(delivered.from, process.env.SMTP_FROM);
  assert.ok(delivered.text.includes('Password<&123'));
  assert.ok(delivered.html.includes('&lt;Cliente&gt;'));
  assert.ok(delivered.html.includes('Password&lt;&amp;123'));
  assert.ok(!delivered.html.includes('<Cliente>'));
});

test('rejected recipients and authentication failures are reported without leaking SMTP secrets', async t => {
  const transport = { sendMail: async () => ({ accepted: [], rejected: ['client@example.invalid'] }), close() {} };
  t.mock.method(nodemailer, 'createTransport', () => transport);
  const message = { to: 'client@example.invalid', nombre: 'Client', temporaryPassword: 'Temporary123!' };
  assert.equal((await sendTemporaryPasswordEmail(message)).code, 'EMAIL_REJECTED');
  transport.sendMail = async () => { throw Object.assign(new Error('secret-from-server'), { code: 'EAUTH', responseCode: 535 }); };
  const failed = await sendTemporaryPasswordEmail(message);
  assert.equal(failed.sent, false);
  assert.equal(failed.code, 'EMAIL_AUTH');
  assert.ok(!JSON.stringify(failed).includes('secret-from-server'));
});

test('email diagnostics verify authentication without sending messages and identify connection errors', async t => {
  let sent = false;
  const transport = { verify: async () => true, sendMail: async () => { sent = true; }, close() {} };
  t.mock.method(nodemailer, 'createTransport', () => transport);
  assert.equal((await verifyEmailConnection()).ready, true);
  assert.equal(sent, false);
  transport.verify = async () => { throw Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' }); };
  const failed = await verifyEmailConnection();
  assert.equal(failed.ready, false);
  assert.equal(failed.code, 'EMAIL_CONNECTION');
});
