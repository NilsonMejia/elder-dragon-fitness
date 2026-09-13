const crypto = require('crypto');

const generateTemporaryPassword = () => {
  const token = crypto.randomBytes(6).toString('base64url');
  return `Edf-${token}1!`;
};

module.exports = {
  generateTemporaryPassword,
};
