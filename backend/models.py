
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Product(db.Model):
    """Model for products."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    sku = db.Column(db.String(50), unique=True, nullable=False)
    stock_level = db.Column(db.Integer, default=0)

    # עמודות נוספות:
    category = db.Column(db.String(50), nullable=True)
    price = db.Column(db.Float, nullable=True)
    cost = db.Column(db.Float, nullable=True)

    def to_dict(self):
        """Convert the product to a dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'sku': self.sku,
            'stock_level': self.stock_level,
            'category': self.category,
            'price': self.price,
            'cost': self.cost
        }


class RestockLog(db.Model):
    """Model for restock logs."""
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
         return {
             "id": self.id,
            "name": self.name,
            "sku": self.sku,
            "category": self.category,
            "price": self.price,
            "cost": self.cost,
            "stock": self.stock_level,  # שים לב - זה חשוב
            "low_stock_threshold": 10,  # אם אין עמודה כזו במסד נתונים, תחזיר ערך קבוע
            "description": "",  # אם אין עמודה כזו, תחזיר מחרוזת ריקה
    }
 
