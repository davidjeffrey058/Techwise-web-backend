const express = require('express');
const productController = require('../controllers/productControllers');
const productRoute = express.Router();

// All users previlages
productRoute.use((req, res, next) => {
    console.log(req.path);
    next();
})
productRoute.get('', productController.allProducts);
productRoute.get('/:id', productController.singleProduct);
productRoute.get('/category/:cat', productController.byCategory);
productRoute.get('/search', productController.search);

// Authenticated user previlages
productRoute.post('/user-product', productController.wishOrCart);

// Admin user previlages
productRoute.post('/upload', productController.addProduct);
productRoute.delete('/:id', (req, res) => { });
productRoute.patch('/:id', (req, res) => { });

module.exports = productRoute;
