const { isValidObjectId } = require('mongoose');
const { errorResponse, jsonResponse } = require('../methods');
const CustomError = require('../models/customError');
const Product = require('../models/productModel');
const { uploadBytesResumable, getStorage, getDownloadURL, ref, deleteObject } = require('firebase/storage');
const app = require('../services/firebase');

async function uploadImage(files, name){
    const imageName = name + Date.now();
    const storageRef = ref(storage, `products/${imageName}`);
    const metadata = {
        contentType: files[i].mimetype
    }

    const results = await uploadBytesResumable(storageRef, files[i].buffer, metadata);

    return {
        image_name: imageName,
        download_url: await getDownloadURL(results.ref)
    };
}

// Get all products with limit
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

// Get products by category
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
            price,
            quantity,
            sub_category,
        } = req.body;

        // const exists = await Product.findOne({ name });
        // if (exists) throw new CustomError('Product already exists', 400);

        const files = req.files;

        if (!files) throw new CustomError('Add at least a file', 400);

        const storage = getStorage(app);
        let image_urls = [];

        for (var i = 0; i < files.length; i++) {
            // const imageName = name + Date.now();
            // const storageRef = ref(storage, `products/${imageName}`);
            // const metadata = {
            //     contentType: files[i].mimetype
            // }

            // const results = await uploadBytesResumable(storageRef, files[i].buffer, metadata);

            // const downloadUrl = await getDownloadURL(results.ref);

            image_urls.push({image_name: imageName, download_url: await uploadImage(files, name)});
        }

        const result = await Product.create({
            name,
            description,
            category,
            key_properties: JSON.parse(key_properties),
            price,
            image_urls,
            quantity,
            sub_category,
        });

        jsonResponse(res, { result })

    } catch (error) {
        console.log(error.message)
        errorResponse(res, error);
    }
}

// Delete a product
const deleteProduct = async (req, res) => {
    try{
        const id = req.params.id;
        if (!isValidObjectId(id)) throw new CustomError('Invalid product id', 400);
        const product = await Product.findOne({ _id: id });
        if (!product) throw new CustomError('Product already deleted', 404);

        const storage = getStorage(app);
    
        const imgUrls = product.image_urls;

        await product.deleteOne();

        imgUrls.forEach(async (image) => {
            const imgRef = ref(storage, `products/${image.image_name}`);
            await deleteObject(imgRef);
        })

        jsonResponse(res, {message: "Product deleted"});
    }catch(error){
        errorResponse(res, error);
    }
}

// Update a product
const updateProduct = async (req, res) => {
    try{
        const id = req.params.id;
        if (!isValidObjectId(id)) throw new CustomError('Invalid product id', 400);
        const product = await Product.findOne({ _id: id });
        if (!product) throw new CustomError('Product not found', 404);

        const storage = getStorage(app);
        const reqBody = req.body;
        const files = req.files;
        const imagesToRemove = reqBody.images_to_remove;

        if(imagesToRemove){
            imagesToRemove.forEach(async (imageName) => {
                await product.updateOne(
                    {$pull: {
                        image_urls: {image_name: imageName}
                    }}
                );

                const imgRef = ref(storage, `products/${imageName}`);
                await deleteObject(imgRef);
            })  
        }

        if(files){
            const totalImages = product.image_urls.length;
            if(totalImages >= 10) throw CustomError('Can\'t add more images', 400);

            const size = 10 - totalImages;
            for(var i = 0; i < size; i++){
                await product.updateOne(
                    {$push: {
                        image_urls: {
                            image_name: (await uploadImage(files, product.name)).image_name,
                            download_url: (await uploadImage(files, product.name)).download_url
                        }
                    }}
                );
            }
        }

        await product.updateOne({
            name: reqBody.name,
            description: reqBody.description,
            category: reqBody.category,
            price: reqBody.price,
            quantity: reqBody.quantity
        })
    } catch (error){
        errorResponse(res, error);
    }
}


module.exports = {
    allProducts,
    singleProduct,
    byCategory,
    addProduct,
    productSearch,
    wishOrCart,
    deleteProduct,
    updateProduct
}