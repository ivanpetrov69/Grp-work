// server.js
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Error connecting to MongoDB: ', err));

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Set up file upload (multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add unique timestamp to filename
  }
});
const upload = multer({ storage });

// Define Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  category: String,
  stock: Number,
  imageUrl: String,
});

const Product = mongoose.model('Product', productSchema);

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add product (POST)
app.post('/add-product', upload.single('image'), async (req, res) => {
  const { name, price, description, category, stock } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;

  const newProduct = new Product({
    name,
    price,
    description,
    category,
    stock,
    imageUrl,
  });

  await newProduct.save();
  res.json({ message: 'Product added successfully!' });
});

// Get all products (GET)
app.get('/get-products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Delete product (DELETE)
app.delete('/delete-product/:id', async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  res.status(200).send();
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
