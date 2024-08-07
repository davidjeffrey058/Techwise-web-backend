const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Address = new Schema({
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Address', Address);