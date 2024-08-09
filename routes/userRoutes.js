const express = require('express');
const userController = require('../controllers/userController');
const userRouter = express.Router();
const requireAuth = require('../middlewares/requireAuth');
const upload = require('../utils/upload');

userRouter.post('/login', userController.login);
userRouter.post('/register', userController.register);

userRouter.get('/:uid/verify/:token', userController.verify);
userRouter.post('/:uid/change-password/:token', userController.changePassword);
userRouter.post('/pass-reset-otp', userController.resetPassword);

userRouter.use(requireAuth);
userRouter.post('/cart-wishlist', userController.addOrRemoveFromCartOrWishlist);
userRouter.post('/update-profile', upload.single('file'), userController.updateUserProfile);


module.exports = userRouter;