// import express
const express = require('express');

// inisiasi express
const app = express();

// import data produk
const products = require('./data/products.json');

// nilai saldo
let credit = 25000000;

// cart untuk menyimpan produk yang dibeli
let cart = {};

// gunakan middleware untuk membaca request JSON
app.use(express.json());

// jalankan server pada port 3000
app.listen(3000, () => {
  console.log('Server berjalan di port 3000');
});

// endpoint untuk menampilkan semua data produk
app.get('/api/products', (req, res) => {
  return res.json({ data: products });
});

// endpoint untuk menambah barang ke cart
app.post('/api/cart', (req, res) => {
  // ambil data produk dari body request
  const { productId, quantity } = req.body;

  // cek apakah produk ada di data produk
  const product = products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({
      message: 'Product tidak terdaftar',
    });
  }

  // cek apakah quantity yang diminta sesuai dengan stock
  if (quantity > product.stock) {
    return res.status(400).json({
      message: 'Stock tidak mencukupi',
    });
  }

  // cek apakah produk sudah ada di cart
  if (cart[productId]) {
    // jika sudah ada, pastikan total barang sesuai dengan stock
    if (cart[productId].quantity + quantity > product.stock) {
      return res.status(400).json({
        message: 'Stock tidak mencukupi',
      });
    }

    // tambahkan quantity ke cart
    cart[productId].quantity += quantity;

    // tambahkan total
    cart[productId].total += quantity * product.price;
  } else {
    // jika belum ada, tambahkan produk ke cart
    cart[productId] = {
      name: product.name,
      description: product.description,
      brand: product.brand,
      price: product.price,
      quantity: quantity,
      total: product.price * quantity,
    };
  }

  return res.json({
    message: 'Product berhasil ditambahkan ke cart',
    data: Object.values(cart),
  });
});

// endpoint untuk menampilkan cart
app.get('/api/cart', (req, res) => {
  return res.json({ data: Object.values(cart) });
});

// endpoint untuk mengosongkan cart
app.delete('/api/cart', (req, res) => {
  cart = {};
  return res.json({ message: 'Cart berhasil dikosongkan' });
});

// endpoint untuk mengecek saldo
app.get('/api/credit', (req, res) => {
  return res.json({ data: credit });
});

// endpoint untuk checkout
app.post('/api/checkout', (req, res) => {
  // ambil data dari body request
  const { name, address, phone } = req.body;

  // cek apakah cart kosong
  if (Object.keys(cart).length === 0) {
    return res.status(400).json({
      message: 'Cart masih kosong',
    });
  }

  // hitung total harga
  let total = 0;
  for (const item of Object.values(cart)) {
    total += item.total;
  }

  // cek apakah saldo cukup
  if (total > credit) {
    return res.status(400).json({
      message: 'Saldo tidak mencukupi',
    });
  }

  // kurangi saldo
  credit -= total;
  
  // kirim pesan
  return res.json({
    message: 'Pesanan berhasil diproses',
    data: {
      name,
      address,
      phone,
      total,
      credit,
    },
  });
});
