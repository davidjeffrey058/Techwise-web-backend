const { isValidObjectId } = require('mongoose');
const { errorResponse, jsonResponse } = require('../methods');
const CustomError = require('../models/customError');
const Product = require('../models/productModel');
const { uploadBytesResumable, getStorage, getDownloadURL, ref } = require('firebase/storage');
const app = require('../services/firebase');

// Get all products
const allProducts = async (req, res) => {
    try {
        const interval = req.query.interval || 0;
        const productsPerInterval = 10;

        const products = await Product.find()
            .skip(interval * productsPerInterval)
            .limit(productsPerInterval);

        jsonResponse(res, { products })
    } catch (error) {
        errorResponse(res, error);
    }
}

// Get a single product by id
const singleProduct = async (req, res) => {
    try {
        const id = req.params.id;
        if (!isValidObjectId(id)) throw new CustomError('Invalid product id', 400);
        const product = await Product.findOne({ _id: id });
        if (!product) throw new CustomError('Product not found', 404);
        jsonResponse(res, { product })
    } catch (error) {
        errorResponse(res, error);
    }
}

// Get a products by category
const byCategory = async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.cat });
        if (products.length === 0) throw new CustomError('No products found', 404);

        jsonResponse(res, { products })
    } catch (error) {
        console.log(error);
        errorResponse(res, error);
    }
}

// Search a product
const productSearch = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) throw new CustomError('Invalid query parameter', 400)
        const result = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        })
        if (result.length === 0) throw new CustomError('No search result found', 404);

        jsonResponse(res, { result })
    } catch (error) {
        errorResponse(res, error);
    }
}

const wishOrCart = async (req, res) => {
    try {
        const { wishlist, cart } = req.user;
        const option = req.query.option;

        if (!option) throw new CustomError('Invalid query parameter', 400);

        if (option.toLowerCase() === 'wishlist') {

            const userWishlist = await Product.find({ _id: { $in: wishlist } });
            jsonResponse(res, { wishlist: userWishlist })
        } else if (option.toLowerCase() === 'cart') {

            const userCart = await Product.find({ _id: { $in: cart } });
            jsonResponse(res, { cart: userCart })

        } else {
            throw new CustomError('Invalid query parameter', 400);
        }

    } catch (error) {
        // console.log(error);
        errorResponse(res, error);
    }
}



// Add a product
const addProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            key_properties,
            // num_of_reviews,
            price,
            quantity,
            sub_category,
            // total_rating,
        } = req.body;

        const exists = await Product.findOne({ name });
        if (exists) throw new CustomError('Product already exists', 400);

        const files = req.files;

        if (!files) throw new CustomError('Add at least a file', 400);

        const storage = getStorage(app);
        let image_urls = [];

        for (var i = 0; i < files.length; i++) {
            const storageRef = ref(storage, `products/${name + Date.now()}`);
            const metadata = {
                contentType: files[i].mimetype
            }

            const results = await uploadBytesResumable(storageRef, files[i].buffer, metadata);

            const downloadUrl = await getDownloadURL(results.ref);

            image_urls.push(downloadUrl);
        }

        const result = await Product.create({
            name,
            description,
            category,
            key_properties: JSON.parse(key_properties),
            // num_of_reviews,
            price,
            image_urls,
            quantity,
            sub_category,
            // total_rating,
        });

        jsonResponse(res, { result })

    } catch (error) {
        console.log(error.message)
        errorResponse(res, error);
    }
}


module.exports = {
    allProducts,
    singleProduct,
    byCategory,
    addProduct,
    productSearch,
    wishOrCart
}