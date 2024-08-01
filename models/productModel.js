const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image_urls: {
        type: Array,
        required: true
    },
    key_properties: {
        type: Object,
        required: false
    },
    num_of_reviews: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    sub_category: {
        type: String,
        required: true
    },
    total_rating: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('Product', productSchema);