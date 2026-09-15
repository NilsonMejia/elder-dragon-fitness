const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const recepcionRoutes = require('./routes/recepcionRoutes');
const deportivoRoutes = require('./routes/deportivoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');

// Inicializamos la aplicación
const app = express();

// Middlewares (Configuraciones base)
app.use(cors()); // Permite conexiones externas
app.use(express.json()); // Permite recibir datos en formato JSON

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recepcion', recepcionRoutes);
app.use('/api/deportivo', deportivoRoutes);
app.use('/api/cliente', clienteRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Elder Dragon Fitness API' });
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Servidor de Elder Dragón Fitness funcionando perfectamente!');
});

// Definimos el puerto (usará el de producción o el 3000 local)
const PORT = process.env.PORT || 3000;

// Encendemos el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
