const express = require('express');
const userController = require('../controllers/userController');
const userRouter = express.Router();

userRouter.get('/:id', userController.wishlist);
userRouter.get('/list/:id', userController.listOfWishlist);
userRouter.get('/cart/:id', userController.userCart);
userRouter.get('/cart/list/:id', userController.listOfCart);

userRouter.post('/list/:id', userController.addOrRemoveWish);
userRouter.post('/cart/:id', userController.addOrRemoveFromCart);


module.exports = userRouter;