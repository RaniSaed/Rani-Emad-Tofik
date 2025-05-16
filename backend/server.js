const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./db");

app.use(cors());
app.use(express.json());

// GET all products
app.get("/api/products", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM products ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new product
app.post("/api/products", async (req, res) => {
  const { name, sku, category, price, cost, stock, lowStockThreshold, description } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO products 
       (name, sku, category, price, cost, stock, low_stock_threshold, description) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, sku, category, price, cost, stock, lowStockThreshold, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/products error:", err);
    res.status(500).json({ error: err.message });
  }
});



// PUT update product
app.put("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, sku, category, price, cost, stock, lowStockThreshold, description } = req.body;
  try {
    const result = await db.query(
      `UPDATE products SET 
       name=$1, sku=$2, category=$3, price=$4, cost=$5, stock=$6, low_stock_threshold=$7, description=$8 
       WHERE id=$9 RETURNING *`,
      [name, sku, category, price, cost, stock, lowStockThreshold, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM products WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});
