import dotenv from 'dotenv';
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

dotenv.config();

const APP = express();
const PORT = process.env.PORT || 3000;

APP.use(cors());
APP.use(express.static('public'));

APP.get('/weather', async (req, res) => {
  const CITY = req.query.city;
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  if (!CITY) {
    return res.status(400).json({ error: 'Ville manquante' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'Clé API manquante' });
  }

  try {
    const URL1 = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(CITY)}&appid=${API_KEY}&units=metric&lang=fr`;
    const URL2 = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(CITY)}&appid=${API_KEY}&units=metric&lang=fr`;

    const [RES1, RES2] = await Promise.all([fetch(URL1), fetch(URL2)]);
    
    if (!RES1.ok) {
      const DATA1 = await RES1.json();
      return res.status(RES1.status).json({ error: DATA1.message || "Erreur API météo" });
    }

    if (!RES2.ok) {
      const DATA2 = await RES2.json();
      return res.status(RES2.status).json({ error: DATA2.message || "Erreur API météo" });
    }

    const [DATA1, DATA2] = await Promise.all([RES1.json(), RES2.json()]);

    res.json({ current: DATA1, forecast: DATA2 });
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

APP.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});