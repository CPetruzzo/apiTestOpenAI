const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Ruta para insertar productos
router.post('/products', async (req, res) => {
  try {
    const products = req.body;
    console.log('products', products)
    await Product.insertMany(products);
    res.status(200).json({ message: 'Products inserted successfully' });
  } catch (error) {
    console.error('Error inserting products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
