const express = require('express');
const isAdmin = require('../middlewares/isAdmin');
const categoryController = require('../controllers/categoryController');
const multer = require('multer');
const requireAuth = require('../middlewares/requireAuth');

const upload = multer({
    storage: multer.memoryStorage(),
});

const categoryRouter = express.Router();

categoryRouter.get('', categoryController.getAllCategories);

categoryRouter.use(requireAuth);
categoryRouter.use(isAdmin);
categoryRouter.post('', upload.single('file'), categoryController.addCategory);
categoryRouter.patch('/:id', upload.single('file'), categoryController.updateCategory);
categoryRouter.delete('/:id', categoryController.deleteCategory);

module.exports = categoryRouter;