const { errorResponse, jsonResponse } = require('../methods');
const CustomError = require('../models/customError');
const Product = require('../models/productModel');

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
        const product = await Product.findOne({ _id: req.params.id });
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
        const query = req.query.p;
        const { wishlist, cart } = req.body;
        if (!query) throw new CustomError('Invalid query parameter', 400);

        if (query === 'WISH') {

            const userWishlist = await Product.find({ _id: { $in: wishlist } });
            jsonResponse(res, { wishlist: userWishlist })
        } else if (query === 'CART') {

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
        const result = await Product.create(req.body);
        jsonResponse(res, { result })
    } catch (error) {
        // console.log(error.message)
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