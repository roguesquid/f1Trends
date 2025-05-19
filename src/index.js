import express from 'express';
import mongoose from 'mongoose';
import tweetsRouter from './routes/tweets.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const DB_USER = process.env.MONGO_INITDB_ROOT_USERNAME || 'f1admin';
const DB_PASS = process.env.MONGO_INITDB_ROOT_PASSWORD || '12345';
const DB_NAME = process.env.MONGO_INITDB_DATABASE || 'f1database';
const DB_HOST = process.env.MONGO_HOST || 'db';
const DB_PORT = process.env.MONGO_PORT || '27017';

const MONGODB_URI = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Usa el middleware nativo de Express para JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/tweets', tweetsRouter);

app.use(express.static(path.join(__dirname, 'view')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'view', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});