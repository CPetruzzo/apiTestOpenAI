const express = require('express');
const axios = require('axios');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const MAX_RETRIES = 5; // Número máximo de reintentos
const RETRY_DELAY = 1000; // Retraso inicial en milisegundos

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const fetchOpenAIResponse = async (prompt, productCards, retries = 0) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/engines/gpt-3.5-turbo-instruct/completions', {
      prompt: `${prompt} ${productCards}`,
      max_tokens: 150,
      stream: true
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      responseType: 'stream'
    });

    return response;
  } catch (error) {
    if (error.response && error.response.status === 429 && retries < MAX_RETRIES) {
      console.log(`Rate-limited by OpenAI API. Retrying in ${RETRY_DELAY * (2 ** retries)}ms...`);
      await delay(RETRY_DELAY * (2 ** retries));
      return fetchOpenAIResponse(prompt, productCards, retries + 1);
    } else {
      throw error;
    }
  }
};

router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log('Prompt recibido:', prompt);

    if (!mongoose.connection.readyState) {
      throw new Error('No hay conexión a la base de datos');
    }

    const products = await Product.find().limit(3);

    if (!products || products.length === 0) {
      console.log('No se encontraron productos');
      return res.status(404).json({ error: 'No se encontraron productos' });
    }

    console.log('products.length', products.length);
    console.log('products', products)

    const productCards = products.map(p => `\`product card ${p._id}\``).join(' ');

    const openaiResponse = await fetchOpenAIResponse(prompt, productCards);

    openaiResponse.data.pipe(res);

  } catch (error) {
    console.error('Error en el servidor:', error.message);

    if (error.response && error.response.status === 429) {
      console.error('Rate-limited by OpenAI API');
      if (!res.headersSent) {
        return res.status(429).json({ error: 'Rate-limited by OpenAI API' });
      }
    }

    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno en el servidor' });
    }
  }
});

module.exports = router;
