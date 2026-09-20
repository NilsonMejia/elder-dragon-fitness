const nodemailer = require('nodemailer');
require('../config/env');

const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const createTransporter = () => {
  const missing = ['GMAIL_USER', 'GMAIL_APP_PASSWORD', 'SMTP_FROM']
    .filter(key => !process.env[key]?.trim());
  if (missing.length) {
    const error = new Error(`Falta configurar ${missing.join(', ')} en backend/.env.`);
    error.code = 'EMAIL_CONFIG';
    throw error;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    auth: {
      user: process.env.GMAIL_USER.trim(),
      pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, ''),
    },
  });
};

const emailFailure = (error) => {
  if (error.code === 'EMAIL_CONFIG') return { code: error.code, reason: error.message };
  if (error.code === 'EAUTH' || error.responseCode === 535) {
    return { code: 'EMAIL_AUTH', reason: 'Gmail rechazó las credenciales. Revisa GMAIL_USER y GMAIL_APP_PASSWORD en backend/.env.' };
  }
  if (['ECONNECTION', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ETIMEOUT', 'EDNS', 'ENOTFOUND', 'ESOCKET'].includes(error.code)) {
    return { code: 'EMAIL_CONNECTION', reason: 'No se pudo completar la conexión con Gmail. Revisa la conexión de red y vuelve a intentarlo.' };
  }
  if (error.code === 'EENVELOPE') {
    return { code: 'EMAIL_REJECTED', reason: 'Gmail rechazó el remitente o destinatario. Revisa el correo del usuario y SMTP_FROM en backend/.env.' };
  }
  return { code: 'EMAIL_SEND', reason: 'Gmail no confirmó el envío del correo. Entrega la contraseña temporal al usuario.' };
};

const verifyEmailConnection = async () => {
  let transporter;
  try {
    transporter = createTransporter();
    await transporter.verify();
    return { ready: true };
  } catch (error) {
    return { ready: false, ...emailFailure(error) };
  } finally {
    transporter?.close();
  }
};

const buildTemporaryPasswordEmailHtml = ({ nombre, to, temporaryPassword }) => {
  const safeNombre = escapeHtml(nombre);
  const safeTo = escapeHtml(to);
  const safeTemporaryPassword = escapeHtml(temporaryPassword);

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Acceso a Elder Dragon Fitness</title>
  </head>
  <body style="margin:0;background:#07111f;color:#e8fff4;font-family:Montserrat,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#07111f;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#0b1728;border:1px solid rgba(0,255,136,.28);border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:32px 28px 18px;text-align:center;background:#081322;">
                <div style="width:84px;height:84px;margin:0 auto 18px;border:2px solid #00ff88;border-radius:50%;line-height:84px;color:#00ff88;font-size:34px;font-weight:800;">
                  EDF
                </div>
                <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:1.2;">Elder Dragon Fitness</h1>
                <p style="margin:10px 0 0;color:#00ff88;font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Credenciales de acceso</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 28px 10px;">
                <h2 style="margin:0 0 12px;color:#ffffff;font-size:22px;">Bienvenido, ${safeNombre}</h2>
                <p style="margin:0 0 22px;color:#b8c7d9;font-size:15px;line-height:1.65;">
                  Tu cuenta fue creada correctamente. Usa estas credenciales para tu primer inicio de sesion.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#07111f;border:1px solid rgba(0,255,136,.35);border-radius:12px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0 0 8px;color:#7f91a8;font-size:13px;">Correo</p>
                      <p style="margin:0 0 18px;color:#ffffff;font-size:16px;font-weight:700;">${safeTo}</p>
                      <p style="margin:0 0 8px;color:#7f91a8;font-size:13px;">Contrasena temporal</p>
                      <p style="margin:0;color:#00ff88;font-size:28px;font-weight:800;letter-spacing:.12em;">${safeTemporaryPassword}</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:22px 0 0;color:#b8c7d9;font-size:15px;line-height:1.65;">
                  Por seguridad, el sistema te pedira crear una contrasena definitiva antes de ingresar al panel.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 30px;">
                <p style="margin:0;color:#6f8095;font-size:12px;line-height:1.6;">
                  Si no esperabas este correo, contacta al administrador de Elder Dragon Fitness.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const sendTemporaryPasswordEmail = async ({ to, nombre, temporaryPassword }) => {
  let transporter;
  try {
    transporter = createTransporter();
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM.trim(),
      to,
      subject: 'Acceso a Elder Dragon Fitness',
      text: `Hola ${nombre},\n\nSe creo tu usuario en Elder Dragon Fitness.\n\nCorreo: ${to}\nContrasena temporal: ${temporaryPassword}\n\nPor seguridad, deberas cambiar esta contrasena durante tu primer inicio de sesion.\n\nElder Dragon Fitness`,
      html: buildTemporaryPasswordEmailHtml({ nombre, to, temporaryPassword }),
    });

    if (!result.accepted?.length) {
      return { sent: false, code: 'EMAIL_REJECTED', reason: 'Gmail no aceptó el destinatario. Revisa el correo del usuario.' };
    }
    return { sent: true };
  } catch (error) {
    return { sent: false, ...emailFailure(error) };
  } finally {
    transporter?.close();
  }
};

module.exports = {
  sendTemporaryPasswordEmail,
  verifyEmailConnection,
};
