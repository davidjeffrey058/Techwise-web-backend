const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Users"
    },
    token: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now(),
        expires: 3600
    },
    for_pass: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('Token', tokenSchema)