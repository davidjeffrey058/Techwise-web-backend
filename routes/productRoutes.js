const express = require('express');
const productController = require('../controllers/productControllers');
const productRoute = express.Router();

productRoute.get('', productController.allProducts);
productRoute.get('/:id', productController.singleProduct);
productRoute.get('/category/:cat', productController.byCategory);
productRoute.get('/search/:q', productController.search);

productRoute.post('', productController.addProduct);

module.exports = productRoute;
