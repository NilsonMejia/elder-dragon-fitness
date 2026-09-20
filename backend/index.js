const express = require('express');
const cors = require('cors');
require('./config/env');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const recepcionRoutes = require('./routes/recepcionRoutes');
const deportivoRoutes = require('./routes/deportivoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');

// Inicializamos la aplicación
const app = express();

// Middlewares (Configuraciones base)
app.use(cors()); // Permite conexiones externas
app.use(express.json());
const pool = require('./config/db');
const { syncMemberships } = require('./services/membershipService');
let syncing;
let lastSync = 0;
app.use(async (req,res,next) => {
  try {
    if (Date.now()-lastSync>60000) {
      syncing ||= syncMemberships().then(()=>{lastSync=Date.now();}).finally(()=>{syncing=null;});
      await syncing;
    }
    next();
  } catch(error) { next(error); }
}); // Permite recibir datos en formato JSON

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recepcion', recepcionRoutes);
app.use('/api/deportivo', deportivoRoutes);
app.use('/api/cliente', clienteRoutes);

app.get('/api/health', async (req, res) => {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'Elder Dragon Fitness API' });
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Servidor de Elder Dragón Fitness funcionando perfectamente!');
});

// Definimos el puerto (usará el de producción o el 3000 local)
const PORT = process.env.PORT || 3000;

// Encendemos el servidor
app.use((error,req,res,next)=>{
  console.error(error.message);
  if(res.headersSent) return next(error);
  const status=error.status || (['22P02','22007','22008','23514'].includes(error.code)?400:error.code==='23503'?409:500);
  res.status(status).json({message:status===500?'Error interno del servidor.':status===409?'El registro tiene relaciones o referencias inválidas.':error.status?error.message:'Datos inválidos.'});
});
if(require.main===module){
  require('./database/migrate')().then(()=>syncMemberships()).then(()=>{
    const server=app.listen(PORT,()=>console.log('Servidor en http://localhost:'+PORT));
    const timer=setInterval(()=>syncMemberships().catch(e=>console.error(e.message)),60000);
    timer.unref();
    const stop=()=>{clearInterval(timer);server.close(()=>pool.end());};
    process.on('SIGTERM',stop);process.on('SIGINT',stop);
  }).catch(error=>{console.error(error.message);process.exitCode=1;pool.end();});
}
module.exports=app;
