# Elder Dragon Fitness

Sistema local de gestión de gimnasio: React/Vite, Express y PostgreSQL.

## Requisitos e instalación

- Node.js **24.21.0 LTS** y npm **11.19.0**. Son las versiones verificadas y fijadas en este proyecto.
- PostgreSQL (probado con PostgreSQL 18), iniciado y accesible.
- Ejecutar los comandos desde la carpeta que contiene este README y package.json.

```powershell
.\scripts\verify-node.ps1
npm.cmd ci
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
```

El backend utiliza únicamente el archivo existente `backend/.env` para la configuración de la aplicación. Se carga por ruta absoluta y sus valores tienen prioridad sobre los heredados de la terminal. Conserva allí DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, JWT_EXPIRES_IN y SEED_TEST_PASSWORD. No publiques el archivo. El frontend usa `http://localhost:3000/api`; para otro servidor configura `VITE_API_URL` durante la compilación.

`verify-node.ps1` comprueba el hash y la firma del ejecutable oficial para Windows x64 antes de ejecutarlo. En otros sistemas verifica la distribución correspondiente con los SHASUMS oficiales. Las dependencias están fijadas con archivos lock; `.npmrc` utiliza el registro oficial y deshabilita scripts automáticos de instalación. No uses `--ignore-scripts=false` sin revisar el paquete que lo requiere. Consulta [la revisión de dependencias](docs/SEGURIDAD.md) para los resultados y el procedimiento de actualización.

## Base de datos existente

```powershell
npm.cmd run db:migrate
```

Las migraciones se registran en `schema_migrations`; son transaccionales y conservan los datos. El backend también aplica las pendientes al iniciar.

## Base de datos nueva

Crea primero una base vacía usando pgAdmin o psql:

```powershell
createdb -U postgres elder-dragon-fitness
npm.cmd --prefix backend run db:demo
npm.cmd run db:seed
```

`db:demo` instala el esquema, datos de ejemplo y migraciones. Usa `db:init` en su lugar para instalar solo el esquema. Ambos rechazan una base que ya tenga la tabla usuarios.

- `database/schema.sql`: estructura inicial, sin datos ni operaciones de borrado.
- `database/demo-data.sql`: datos de ejemplo; solo para una base nueva.
- `database/migrations/`: cambios incrementales.
- `db:seed`: cuentas de prueba y conversión de contraseñas de demostración a bcrypt. Reinicia las contraseñas de esas cuentas; úsalo solo en desarrollo.

## Ejecutar

```powershell
npm.cmd run dev
```

Frontend: http://localhost:5173. API: http://localhost:3000/api/health. La comprobación de salud consulta PostgreSQL. `npm.cmd run build` genera `frontend/dist`; para desplegar, configura HTTPS, el servidor de archivos y la redirección de rutas de React a index.html.

## Cuentas de prueba

Después de `db:seed`, la contraseña corresponde a `SEED_TEST_PASSWORD` (por defecto `Temporal123!`). El acceso especial `123456` fue eliminado.

| Rol | Correo | Pantalla |
| --- | --- | --- |
| Administrador | admin@elderdragon.com | /admin/dashboard |
| Recepcionista | recepcion@elderdragon.com | /recepcion/clientes |
| Entrenador | entrenador@elderdragon.com | /entrenador |
| Cliente | cliente@elderdragon.com | /cliente/perfil |

Las cuentas nuevas requieren cambiar su contraseña temporal. Con Gmail configurado se intenta entregar por correo; si no se logra, administración o recepción ve la contraseña en el resultado del alta. Un fallo de correo no deshace ni duplica el usuario creado.

## Correos con el .env existente

La creación de usuarios desde administración y recepción usa `GMAIL_USER`, `GMAIL_APP_PASSWORD` y `SMTP_FROM` de `backend/.env`. No hay un correo escrito en el código ni se usa `SMTP_PASS` de otra configuración. No es necesario agregar SMTP_HOST o SMTP_PORT: el transporte utiliza Gmail con TLS. La contraseña de aplicación puede pegarse con o sin los espacios de agrupación de Google.

Después de modificar `.env`, reinicia el servidor. Puedes comprobar la conexión y autenticación desde la carpeta principal:

```powershell
npm.cmd run email:check
```

También funciona `node backend/scripts/check-email.js` desde la raíz, o `npm.cmd run email:check` desde backend. La comprobación no envía mensajes ni crea usuarios. Gmail aceptó la autenticación con la configuración local durante la revisión del 20 de septiembre de 2026. [Nodemailer aclara que verificar la conexión no confirma la entrega de un mensaje](https://nodemailer.com/smtp).

Al crear una cuenta, se envía la contraseña temporal a su correo. Si Gmail acepta el envío, aparece la confirmación. Si falla, la pantalla conserva la contraseña temporal y muestra si faltan variables, si Gmail rechazó las credenciales o el destinatario, o si hubo un problema de conexión. La aceptación SMTP no garantiza que el correo llegue a la bandeja principal; puede terminar en spam.

## Reglas de operación

- Una membresía cubre desde `fecha_inicio` inclusive hasta `fecha_fin` exclusiva. Al llegar a la fecha de corte vence. Un pago anticipado agrega los días al final del período ya pagado; no descuenta días disponibles.
- El servidor valida el precio contra el plan. Cada envío lleva un UUID de operación; reintentar la misma operación no genera otro cobro. Un bloqueo por cliente serializa renovaciones simultáneas.
- El estado de las membresías se sincroniza al arrancar, cada minuto mientras el servidor está activo y antes de consultar cuando corresponde. `Inactivo` es una suspensión administrativa y no se levanta automáticamente.
- Los clientes morosos pueden consultar su perfil y rutina. Los usuarios inactivos no pueden iniciar sesión ni usar una sesión anterior. Cambios de rol, estado o contraseña revocan el acceso correspondiente.
- Los avisos de vencimiento se muestran en administración y recepción. Son avisos dentro de la aplicación, no campañas de correo. La anticipación es configurable.
- Cada asignación guarda una copia de los ejercicios, series, repeticiones, pesos y descansos. Editar o eliminar la plantilla no cambia esa copia. Asignar otra rutina archiva la anterior y conserva el seguimiento.
- El entrenador consulta el seguimiento de sus asignaciones; el cliente únicamente el suyo. El administrador puede consultar todas.
- El reporte de morosos cuenta clientes una sola vez y excluye a quienes renovaron con una membresía vigente. Nuevas altas usa la fecha de registro del usuario, no cada renovación. Las fechas históricas desconocidas permanecen vacías: no se inventan fechas de alta.
- Los reportes se descargan en XLSX y PDF. La configuración del gimnasio y el mantenimiento se guardan en PostgreSQL.
- No se registran asistencias físicas, ocupación ni respaldos programados desde la interfaz. Se retiraron los controles e indicadores que simulaban estas funciones. Los recibos internos no son una integración con Hacienda.

## Pruebas y verificaciones

```powershell
npm.cmd test
npm.cmd --prefix frontend run lint
npm.cmd run build
npm.cmd --prefix backend run test:browser
```

Las pruebas de integración y navegador crean una base temporal `edf_test_*` y la eliminan al terminar. Necesitan un usuario PostgreSQL con permiso CREATEDB. No envían correos ni escriben en la base del gimnasio. Las pruebas de navegador usan Edge en Windows; en otros sistemas instala Chromium con Playwright, o define PLAYWRIGHT_EXECUTABLE_PATH.

Cubren permisos por rol, creación y cambio inicial de contraseña, renovaciones y reintentos, morosidad, reportes, asignaciones independientes, seguimiento, mantenimiento, suspensión de usuarios y descargas reales de PDF/Excel.

## Respaldar

```powershell
npm.cmd --prefix backend run db:backup
```

Genera un SQL en `backend/backups/`, excluido de Git. Usa PG_DUMP_PATH cuando pg_dump no está en PATH o PostgreSQL está instalado en otra ruta. Para restaurar en un servidor donde aún no exista la base:

```powershell
psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f respaldo.sql
```

El respaldo incluye CREATE DATABASE. El archivo `backend/database/elder-dragon-fitness-completa.sql` se actualizó el 20 de septiembre de 2026 y se restauró correctamente en una base temporal: 12 tablas, 3 migraciones y 23 usuarios. Es una exportación puntual; no reemplaza la ejecución de migraciones posteriores. Incluye datos y hashes de contraseñas: compártelo únicamente con quienes deban administrar esta base.
