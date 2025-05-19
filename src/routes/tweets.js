import express from 'express';
import Tweet from '../models/post.js';
import { obtenerTweetsPorKeywords } from '../controllers/apiX.js';

const router = express.Router();

router.post('/importar', async (req, res) => {
  try {
    const { keywords, cantidad } = req.body;
    const palabrasClave = keywords || ["formulaone", "formula one", "championship", "pitstop"];
    const cantidadDeTweetsDeseados = cantidad || 20;

    const tweets = await obtenerTweetsPorKeywords(palabrasClave, cantidadDeTweetsDeseados);

    let insertados = 0;
    if (tweets.length > 0) {
      await Tweet.insertMany(tweets, { ordered: false })
        .then(result => { insertados = result.length; })
        .catch(err => {
          if (err.writeErrors) insertados = err.result?.nInserted || 0;
          else throw err;
        });
    }

    // Devuelve también los tweets traídos para mostrarlos en el frontend
    res.json({ ok: true, insertados, total: tweets.length, tweets });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;