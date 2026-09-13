const crypto = require('crypto');

const generateTemporaryPassword = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(8);

  return Array.from(bytes, (byte) => characters[byte % characters.length]).join('');
};

module.exports = {
  generateTemporaryPassword,
};
