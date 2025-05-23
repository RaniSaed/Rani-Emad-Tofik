from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Product, RestockLog
from config import Config


app = Flask(__name__)
app.url_map.strict_slashes = False  # מאפשר גישה גם עם וגם בלי סלש בסוף
app.config.from_object(Config)

# תיקון CORS - אפשר גישה מהפרונטאנד שלך בlocalhost:8080
CORS(app, resources={r"/api/*": {"origins": "http://localhost:8080"}})

db.init_app(app)


@app.route('/api/products', methods=['GET', 'POST'])
def manage_products():
    if request.method == 'GET':
        return get_products()
    elif request.method == 'POST':
        return add_product()


def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products]), 200


def add_product():
    data = request.get_json()
    new_product = Product(
        name=data['name'],
        sku=data['sku'],
        stock_level=data.get('stock_level', 0),
        category=data.get('category'),
        price=data.get('price'),
        cost=data.get('cost')
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify(new_product.to_dict()), 201


@app.route('/api/products/<int:product_id>', methods=['GET', 'PUT', 'DELETE'])
def product_detail(product_id):
    product = Product.query.get_or_404(product_id)
    if request.method == 'GET':
        return jsonify(product.to_dict()), 200
    elif request.method == 'PUT':
        return update_product(product)
    elif request.method == 'DELETE':
        return delete_product(product)


def update_product(product):
    data = request.get_json()
    try:
        product.name = data['name']
        product.sku = data['sku']
        product.category = data.get('category')
        product.price = data.get('price')
        product.cost = data.get('cost')
        product.stock_level = data.get('stock_level', product.stock_level)
        db.session.commit()
        return jsonify(product.to_dict()), 200
    except KeyError as e:
        return jsonify({"error": f"Missing field {e}"}), 400


def delete_product(product):
    db.session.delete(product)
    db.session.commit()
    return jsonify({'result': True}), 204


@app.route('/api/products/<int:product_id>/restock', methods=['POST'])
def restock_product(product_id):
    data = request.get_json()
    product = Product.query.get_or_404(product_id)
    try:
        quantity = data['quantity']
        product.stock_level += quantity
        db.session.add(product)
        db.session.add(RestockLog(product_id=product_id, quantity=quantity))
        db.session.commit()
        return jsonify(product.to_dict()), 200
    except KeyError as e:
        return jsonify({"error": f"Missing field {e}"}), 400


@app.route('/api/restocks', methods=['GET'])
def get_restock_logs():
    logs = RestockLog.query.all()
    return jsonify([log.to_dict() for log in logs]), 200


@app.route('/api/products/low-stock', methods=['GET'])
def low_stock_products():
    threshold = 10  # סף מלאי נמוך
    low_stock = Product.query.filter(Product.stock_level < threshold).all()
    return jsonify([product.to_dict() for product in low_stock]), 200


@app.route('/api/products/analytics', methods=['GET'])
def stock_analytics():
    return jsonify({'message': 'Analytics data will be here.'}), 200


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    # הרצת השרת בפורט 5000 עם debug=True
    app.run(host='localhost', port=5000, debug=True)
