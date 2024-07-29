const express = require('express');
const userController = require('../controllers/userController');
const userRouter = express.Router();

userRouter.post('/login', userController.login)
userRouter.post('/register', userController.register)

userRouter.get('/:id', userController.wishlist);
userRouter.get('/list/:id', userController.listOfWishlist);
userRouter.get('/cart/:id', userController.userCart);
userRouter.get('/cart/list/:id', userController.listOfCart);
userRouter.post('/exist/:id', userController.addUser)

userRouter.post('/list/:id', userController.addOrRemoveWish);
userRouter.post('/cart/:id', userController.addOrRemoveFromCart);


module.exports = userRouter;