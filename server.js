/* activar el servidor del backend 
npm init -y
npm install express body-parser

node server.js
npm install cors
*/

/* puerto 3000 en uso:
netstat -ano | findstr :3000 --> ver que proceso está usando el puerto 3000
taskkill /PID <PID> /F --> matar el proceso
const PORT = 3001; // Cambiar el puerto a 3001
*/
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importar CORS

const app = express();
const PORT = 3000;

// Habilitar JSON parsing en Express
app.use(express.json());

// Configuración de CORS
const corsOptions = {
  origin: 'http://localhost:5173', // Permitir solo este origen
  methods: ['GET', 'POST', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: ['Content-Type'], // Encabezados permitidos
  credentials: true, // Permitir cookies/sesiones si fuera necesario
};

app.use(cors(corsOptions)); // Aplicar configuración de CORS

// Middleware para parsear JSON y datos de formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta para servir archivos estáticos
app.post('/register', (req, res) => {
  console.log('Datos recibidos en el servidor:', req.body);

  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    console.error('Faltan campos obligatorios:', req.body);
    return res.status(400).send('Todos los campos son obligatorios.');
  }

  const validRoles = ['admin', 'user', 'viewer'];
  if (!validRoles.includes(role)) {
    console.error('Rol no válido:', role);
    return res.status(400).send('Rol no válido.');
  }

  // Asegúrate de que cada registro termine con un salto de línea
  const newUser = `${username},${password},${role}\n`;
  const filePath = path.join(__dirname, 'users.csv');
  console.log('Ruta del archivo CSV:', filePath);

  fs.appendFile(filePath, newUser, (err) => {
    if (err) {
      console.error('Error al guardar el usuario:', err);
      return res.status(500).send('Error al guardar el usuario.');
    }
    console.log('Usuario registrado correctamente:', newUser);
    res.status(200).send('Usuario registrado exitosamente.');
  });
});



// Ruta para guardar datos en buscador.csv
app.post('/addData', (req, res) => {
  const { nombre, tematica, latitud, longitud, link, ubicacion, anio, palabraClave, descripcion } = req.body;

  if (!nombre || !tematica || !latitud || !longitud || !link) {
    return res.status(400).send('Todos los campos obligatorios deben ser completados.');
  }

  const filePath = path.join(__dirname, 'public', 'buscador.csv');

  // Leer el archivo CSV existente
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
      console.error('Error al leer el archivo CSV:', err);
      return res.status(500).send('Error al leer el archivo CSV');
  }

  // Dividir el contenido del archivo en líneas
  const lines = data.split('\n');

  // Verificar si el dato ya existe
  const exists = lines.some(line => line.startsWith(`${nombre};`));
  if (exists) {
      console.warn('El dato ya existe en el archivo CSV:', nombre);
      return res.status(400).send('El dato ya existe en el archivo CSV.');
  }

  // Formatear los datos antes de guardarlos
  const newData = `${nombre};${ubicacion || ''};${tematica};${anio || ''};${palabraClave || ''};${latitud};${longitud};${link};${descripcion || ''}\n`;

  // Agregar los nuevos datos al archivo CSV
  fs.appendFile(filePath, newData, (err) => {
      if (err) {
          console.error('Error al guardar los datos:', err);
          return res.status(500).send('Error al guardar los datos.');
      }
      console.log('Datos guardados correctamente:', newData);
      res.status(200).send('Datos guardados correctamente.');
  });
});
});
// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
