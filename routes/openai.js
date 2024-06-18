const express = require('express');
const { OpenAI } = require('openai');
const Product = require('../models/Product');
const router = express.Router();
require('dotenv').config();

// Actualización de la inicialización
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log('Prompt recibido:', prompt);

    const products = await Product.find().limit(3);

    if (!products || products.length === 0) {
      console.log('No se encontraron productos');
      return res.status(404).json({ error: 'No se encontraron productos' });
    }

    const productCards = products.map(p => `Product Name: ${p.name}, Description: ${p.description}, Price: $${p.price}`).join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // O cambia a 'gpt-4' si es necesario
      messages: [
        { role: 'user', content: `${prompt}\n\n${productCards}` }
      ],
      max_tokens: 150,
      temperature: 1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    res.json(response.choices[0].message);
  } catch (error) {
    // Actualización del manejo de errores
    if (error instanceof OpenAI.APIError) {
      console.error(error.status);  // e.g. 401
      console.error(error.message); // e.g. The authentication token you passed was invalid...
      console.error(error.code);    // e.g. 'invalid_api_key'
      console.error(error.type);    // e.g. 'invalid_request_error'
    } else {
      console.log(error);
    }
    res.status(500).json({ error: 'Error interno en el servidor' });
  }
});

module.exports = router;
