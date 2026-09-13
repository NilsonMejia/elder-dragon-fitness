const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

// Inicializamos la aplicación
const app = express();

// Middlewares (Configuraciones base)
app.use(cors()); // Permite conexiones externas
app.use(express.json()); // Permite recibir datos en formato JSON

// Rutas de la API
app.use('/api/auth', authRoutes);

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
