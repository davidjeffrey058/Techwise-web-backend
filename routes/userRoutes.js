const express = require('express');
const userController = require('../controllers/userController');
const userRouter = express.Router();
const requireAuth = require('../middlewares/requireAuth');

userRouter.post('/login', userController.login)
userRouter.post('/register', userController.register)

userRouter.use(requireAuth);
userRouter.post('/list/:id', userController.addOrRemoveWish);
userRouter.post('/cart/:id', userController.addOrRemoveFromCart);


module.exports = userRouter;