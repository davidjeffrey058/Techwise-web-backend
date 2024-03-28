const express = require('express');
const userController = require('../controllers/userController');
const userRouter = express.Router();

userRouter.get('/:id', userController.wishlist);
userRouter.get('/list/:id', userController.listOfWishlist);


module.exports = userRouter;