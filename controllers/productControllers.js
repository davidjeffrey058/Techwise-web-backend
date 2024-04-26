const { getDb } = require('../db');

// ---- ALL GET REQUEST METHOD ----
// Get all products
const allProducts = (req, res) => {
    getDb().collection("products")
        .find({}, { name: 1, price: 1, num_of_reviews: 1, total_rating: 1, image_urls: 1 })
        .toArray()
        .then((products) => {
            res.status(200).json(products);
        })
        .catch(() => {
            res.status(500).json({ error: "Unable to get data" });
        });
}

// Get a single product by id
const singleProduct = (req, res) => {
    getDb().collection('products')
        .findOne({ _id: req.params.id })
        .then(data => {
            res.status(200).json(data);
        })
        .catch(() => {
            res.status(500).json({ error: "Unable to get the data" });
        })
}

// Get a products by category
const byCategory = (req, res) => {
    const category = req.params.cat;
    getDb().collection('products')
        .find({ category: category })
        .toArray()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(() => {
            res.status(500).json({ error: 'Can\'t get the data' });
        })
}

// Search a product
const search = (req, res) => {
    const query = req.params.q;
    getDb().collection('products')
        .find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        })
        .toArray()
        .then(data => res.status(200).json(data))
        .catch(() => res.status(500).json({ error: "Can't get data" }));
}


// --- ALL POST REQUEST METHOD ---
// Add a product
const addProduct = (req, res) => {
    client
        .db().collection("products")
        .insertOne(req.body)
        .then((response) => {
            res.status(200).json(response);
        })
        .catch(() => {
            res.status(500).json({ error: "Unable to add data" });
        });
}


module.exports = {
    allProducts,
    singleProduct,
    byCategory,
    addProduct,
    search,
}