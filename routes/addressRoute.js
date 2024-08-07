const express = require('express');
const requireAuth = require('../middlewares/requireAuth');
const addressRouter = express.Router();
const addressController = require('../controllers/addressController');


addressRouter.use(requireAuth);
addressRouter.get('', addressController.getAddress);
addressRouter.post('', addressController.addAddress);
addressRouter.patch('', addressController.updateAddress);

module.exports = addressRouter;