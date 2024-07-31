const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const CustomError = require('./customError');
const Schema = mongoose.Schema;
const validator = require('validator');

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    cart: {
        type: Array,
        default: []
    },
    wishlist: {
        type: Array,
        default: []
    },
    phone: {
        type: String,
        required: false
    }
});

userSchema.statics.login = async function (email, password) {
    if (!email || !password) throw new CustomError('All fields are required', 400);

    const user = await this.findOne({ email });

    if (!user) throw new CustomError('User not found', 404);

    const same = await bcrypt.compare(password, user.password);

    if (!same) throw new CustomError('Incorrect password for that email', 400);

    return user;
}

userSchema.statics.register = async function (fullname, email, password) {
    if (validator.isEmpty(fullname)) throw new CustomError('Fullname is required', 400);
    if (!validator.isEmail(email)) throw new CustomError('Enter a valid email address', 400);
    if (!validator.isStrongPassword(password)) throw new CustomError('Password must contain a number, a special character, a capital letter, and must be 8 characters long', 400);

    const exists = await this.findOne({ email });
    if (exists) throw new CustomError('Email already exists', 400);

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hash = await bcrypt.hash(password, salt);

    return await this.create({ fullname, email, password: hash });
}

module.exports = mongoose.model('User', userSchema);