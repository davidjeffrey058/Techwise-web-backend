const express = require('express');
const productController = require('../controllers/productControllers');
const productRoute = express.Router();
const requireAuth = require('../middlewares/requireAuth');
const isAdmin = require('../middlewares/isAdmin');

// All users previlages
// productRoute.use((req, res, next) => {
//     console.log(req.path);
//     next();
// })

productRoute.get('/all', productController.allProducts);
productRoute.get('/single/:id', productController.singleProduct);
productRoute.get('/category/:cat', productController.byCategory);
productRoute.get('/search', productController.productSearch);

// Authenticated user previlages
productRoute.use(requireAuth);
productRoute.post('/user-product', productController.wishOrCart);

// Admin user previlages
productRoute.use(isAdmin);
productRoute.post('/upload', productController.addProduct);
productRoute.delete('/:id', (req, res) => { });
productRoute.patch('/:id', (req, res) => { });



module.exports = productRoute;
