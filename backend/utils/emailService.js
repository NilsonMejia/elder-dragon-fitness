const nodemailer = require('nodemailer');

const hasSmtpConfig = () => {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

const createTransporter = () => {
  if (!hasSmtpConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendTemporaryPasswordEmail = async ({ to, nombre, temporaryPassword }) => {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      sent: false,
      reason: 'SMTP no configurado',
    };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'Acceso a Elder Dragon Fitness',
    text: `Hola ${nombre},\n\nSe creo tu usuario en Elder Dragon Fitness.\n\nEsta es tu contrasena temporal: ${temporaryPassword}\n\nInicia sesion y solicita el cambio de contrasena si corresponde.\n\nElder Dragon Fitness`,
  });

  return {
    sent: true,
  };
};

module.exports = {
  sendTemporaryPasswordEmail,
};
