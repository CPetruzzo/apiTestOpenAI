const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const openaiRoutes = require('./routes/openai');
const productRoutes = require('./routes/products');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

app.use('/api', openaiRoutes);
app.use('/api', productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
