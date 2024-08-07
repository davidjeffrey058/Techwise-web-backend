const express = require('express');
const userController = require('../controllers/userController');
const userRouter = express.Router();
const requireAuth = require('../middlewares/requireAuth');

userRouter.post('/login', userController.login);
userRouter.post('/register', userController.register);

userRouter.get('/:email/verify/:token', userController.verify);
userRouter.post('/:email/change-password/:token', userController.changePassword);
userRouter.post('/pass-reset-otp', userController.resetPassword);

userRouter.use(requireAuth);
userRouter.post('/cart-wishlist', userController.addOrRemoveFromCartOrWishlist);


module.exports = userRouter;