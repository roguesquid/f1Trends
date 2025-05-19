import express from 'express';
import Tweet from '../models/post.js';
import { obtenerTweetsPorKeywords } from '../controllers/apiX.js';

const router = express.Router();

// Palabras clave y usuarios pueden configurarse aquí o en apiX.js
const palabrasClaveFormula1 = ["formulaone", "formula one", "championship", "pitstop", "verstappen", "max verstappen", "perez", "sergio perez", "checo",
  "leclerc", "charles leclerc", "sainz", "carlos sainz", "hamilton", "lewis hamilton", "russell", "george russell",
  "norris", "lando norris", "piastri", "oscar piastri", "alonso", "fernando alonso", "stroll", "lance stroll"];
const cantidadDeTweetsPorUsuario = 10;
const listaDeUsuarios = [
  { usuario: 'FastestPitStop', id: '1543874015206559747' },
  { usuario: 'F1', id: '69008563' }
];
const listaDeUserIds = listaDeUsuarios.map(user => user.id);

// Endpoint para importar tweets
router.post('/importar', async (req, res) => {
  try {
    const tweets = await obtenerTweetsPorKeywords(listaDeUserIds, palabrasClaveFormula1, cantidadDeTweetsPorUsuario);

    let insertados = 0;
    let bulkOps = [];
    tweets.forEach(tweet => {
      bulkOps.push({
        updateOne: {
          filter: { id: tweet.id },
          update: { $set: tweet },
          upsert: true
        }
      });
    });

    if (bulkOps.length > 0) {
      const result = await Tweet.bulkWrite(bulkOps, { ordered: false });
      insertados = result.upsertedCount;
    }

    res.json({ ok: true, insertados, total: tweets.length, tweets });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Endpoint para consultar todos los tweets almacenados
router.get('/', async (req, res) => {
  try {
    const tweets = await Tweet.find().sort({ created_at: -1 }).limit(100);
    res.json({ ok: true, tweets });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;