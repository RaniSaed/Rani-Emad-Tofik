const express = require('express');
const app = express();
const PORT = 5000;

// כדי ששרת יבין JSON מהבקשות
app.use(express.json());

// מערך זיכרון שמחזיק את המוצרים
let products = [];

// נתיב לקבלת כל המוצרים
app.get('/api/products', (req, res) => {
  res.json(products);
});

// נתיב להוספת מוצר חדש
app.post('/api/products', (req, res) => {
  const newProduct = req.body;
  
  // בדיקה בסיסית (אופציונלי)
  if (!newProduct || !newProduct.id || !newProduct.name) {
    return res.status(400).json({ error: "Missing product id or name" });
  }

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// הפעלת השרת
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
