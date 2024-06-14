const express = require('express');
const axios = require('axios');
const Product = require('../models/Product');
const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const products = await Product.find();
    const productCards = products.map(p => `\`product card ${p._id}\``).join(' ');

    const response = await axios.post('https://api.openai.com/v1/engines/davinci/completions', {
      prompt: `${req.body.prompt} ${productCards}`,
      max_tokens: 150,
      stream: true
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      responseType: 'stream'
    });

    response.data.pipe(res);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
