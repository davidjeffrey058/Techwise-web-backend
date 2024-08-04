const { jsonResponse, errorResponse } = require("../methods");
const { ref, getStorage, getDownloadURL, uploadBytesResumable, deleteObject } = require('firebase/storage');
const Category = require('../models/categoryModel');
const CustomError = require("../models/customError");
const app = require('../services/firebase');

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        jsonResponse(res, categories);
    } catch (error) {
        errorResponse(res, error);
    }
}

const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;

        const category = await Category.findOne({ _id: id });
        if (!category) throw new CustomError('Category already deleted', 404);

        const storage = getStorage(app);

        const catRef = ref(storage, `categories/${category.category_name}`);

        await deleteObject(catRef);

        await Category.deleteOne({ _id: id });

        jsonResponse(res, { message: 'Category deleted successfully' });
    } catch (error) {
        errorResponse(res, error);
    }
}

const updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const { category_name, parent_id } = req.body;
        var downloadUrl

        const category = await Category.findOne({ _id: id });
        if (!category) throw new CustomError('Category not found', 404)

        if (req.file) {
            const storage = getStorage(app);
            const storageRef = ref(storage, `categories/${category.image_name}`);

            const metadata = {
                contentType: req.file.mimetype
            }

            const results = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
            downloadUrl = await getDownloadURL(results.ref);
        }

        await Category.updateOne({ _id: id }, { $set: { category_name, parent_category_id: parent_id, category_image: downloadUrl } });

        jsonResponse(res, { message: 'Category updated successfully' });

    } catch (error) {
        errorResponse(res, error);
    }
}

const addCategory = async (req, res) => {
    try {
        const { category_name, parent_id, } = req.body;

        const exists = await Category.findOne({ category_name });
        if (exists) throw new CustomError('Category already exists', 400);

        const storage = getStorage(app);
        const storageRef = ref(storage, `categories/${category_name}`);

        const metadata = {
            contentType: req.file.mimetype
        }

        const results = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        const downloadUrl = await getDownloadURL(results.ref);

        await Category.create({
            category_name,
            parent_category_id: parent_id,
            category_image: downloadUrl,
            image_name: category_name
        });

        jsonResponse(res, { message: 'Category added successfully' });

    } catch (error) {
        // console.log(error.message)
        errorResponse(res, error);
    }
}

module.exports = {
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory
}