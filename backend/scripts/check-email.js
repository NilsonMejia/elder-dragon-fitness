const { verifyEmailConnection } = require('../utils/emailService');

verifyEmailConnection().then(result => {
  if (result.ready) {
    console.log('Gmail aceptó la conexión y autenticación con backend/.env. No se envió ningún mensaje.');
  } else {
    console.error(`${result.code}: ${result.reason}`);
    process.exitCode = 1;
  }
}).catch(() => {
  console.error('No se pudo verificar el servicio de correo.');
  process.exitCode = 1;
});
