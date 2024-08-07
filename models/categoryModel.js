const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const categorySchema = new Schema({
    category_name: {
        type: String,
        required: true
    },
    parent_category_id: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    category_image: {
        type: String,
        required: true
    },
    image_name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Category', categorySchema);