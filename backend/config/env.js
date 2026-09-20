const path = require('node:path');
const dotenv = require('dotenv');

// A single, absolute source regardless of where node/npm is launched.
// Node caches this module so loading it again does not reset test overrides.
const envFile = path.resolve(__dirname, '../.env');
const { parsed, error } = dotenv.config({ path: envFile, override: true, quiet: true });
if (error) {
  throw new Error('No se pudo leer backend/.env. Revisa que exista y tenga permisos de lectura.');
}

// Missing application settings must not silently use credentials inherited
// from the terminal or another project.
const applicationKeys = [
  'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_SSL',
  'JWT_SECRET', 'JWT_EXPIRES_IN', 'GMAIL_USER', 'GMAIL_APP_PASSWORD',
  'SMTP_FROM', 'SEED_TEST_PASSWORD', 'PG_DUMP_PATH', 'PORT',
];
for (const key of applicationKeys) {
  if (!Object.hasOwn(parsed, key)) delete process.env[key];
}

module.exports = { envFile };
