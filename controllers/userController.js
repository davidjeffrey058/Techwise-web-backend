const User = require('../models/userModel');
const { createToken, errorResponse, jsonResponse } = require('../methods');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.login(email, password);
        const token = createToken(user._id);

        res.status(200).json({ fullname: user.fullname, email, token, cart: user.cart, wishlist: user.wishlist })
    } catch (error) {
        // console.log(error.message)
        errorResponse(res, error);
    }
}

const register = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;
        const user = await User.register(fullname, email, password);
        const token = createToken(user._id);

        res.status(200).json({ fullname: user.fullname, email, token, cart: user.cart, wishlist: user.wishlist })
    } catch (error) {
        // console.log(error.message)
        errorResponse(res, error);
    }
}

// Add an item to cart
const addOrRemoveFromCart = async (req, res) => {
    try {
        if (req.body.added) {
            await User.updateOne({ _id: req.params.id }, { $pull: { cart: req.body.product } });
            jsonResponse(res, { isAdded: false });
        } else {
            await User.updateOne({ _id: req.params.id }, { $push: { cart: req.body.product } });
            jsonResponse(res, { isAdded: false });
        }

    } catch (error) {
        errorResponse(res, error);
    }
}

// Add or remove a product from cart
const addOrRemoveWish = async (req, res) => {
    try {
        if (req.body.added) {
            await User.updateOne({ _id: req.params.id }, { $pull: { wishlist: req.body.product } });
            jsonResponse(res, { isAdded: false });
        } else {
            await User.updateOne({ _id: req.params.id }, { $push: { wishlist: req.body.product } });
            jsonResponse(res, { isAdded: false });
        }

    } catch (error) {
        errorResponse(res, error);
    }
}

module.exports = {
    addOrRemoveWish,
    addOrRemoveFromCart,
    login,
    register
}