const User = require('../models/userModel');
const Token = require('../models/tokenModel');
const sendEmail = require('../utils/sendEmail');
const { createToken, errorResponse, jsonResponse, createOtp } = require('../methods');
const CustomError = require('../models/customError');
const { isValidObjectId } = require('mongoose');
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage');
const app = require('../services/firebase');
const validator = require('validator');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

async function emailSent(otp, email) {
    return await sendEmail(email, 'Verify your email address', `Enter the following code in the application to verify your account:\n 
        ${otp}\n\n This code expires in 1 hour`);
}

async function GoogleAuth(accessToken, res) {
    const result = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (result.error) throw new CustomError(result.error_description, 401);

    const fullname = result.data.given_name + ' ' + result.data.family_name;
    const email = result.data.email;
    const image_url = result.data.picture;

    const user = await User.findOne({ email });

    if (user) {
        const token = createToken(user._id);
        return jsonResponse(res, { fullname, email, token, image_url });
    }

    const createdUser = await User.create({ fullname, email, verified: true, image_url });
    return jsonResponse(res, { fullname, email, token: createToken(createdUser._id), image_url });
}

const login = async (req, res) => {
    try {
        if (req.body.google_access_token) {
            await GoogleAuth(req.body.google_access_token, res);
        } else {
            const { email, password } = req.body;
            const user = await User.login(email, password);

            if (!user.verified) {
                const token = await Token.findOne({ user_id: user._id, for_pass: false });

                if (token) {
                    return jsonResponse(res, { message: 'Otp already sent to your email please verify account' }, 201);
                }

                const result = await Token.create({ user_id: user._id, token: createOtp(), for_pass: false });

                const sent = await emailSent(result.token, email);

                if (!sent) throw new CustomError("Unable to send email verification otp", 500);

                return jsonResponse(res, { message: 'Otp sent to your email please verify account' }, 201)

            }

            const token = createToken(user._id);
            jsonResponse(res, { fullname: user.fullname, email: user.email, token, image_url: user.image_url });
        }

    } catch (error) {
        // console.log(error.message)
        errorResponse(res, error);
    }
}

const register = async (req, res) => {
    try {

        // Register with google Signup method
        if (req.body.google_access_token) {
            await GoogleAuth(req.body.google_access_token, res);
        } else {

            // Email and Password signup method
            const { fullname, email, password } = req.body;
            const user = await User.register(fullname, email, password);

            const result = await Token.create({ user_id: user._id, token: createOtp(), for_pass: false });

            const sent = await emailSent(result.token, email);

            if (!sent) throw new CustomError("Unable to send email verification otp", 500);

            return jsonResponse(res, { message: 'Otp sent to your email please verify account', user_id: user._id }, 201)
        }
    } catch (error) {
        // console.log(error.message)
        errorResponse(res, error);
    }
}

const verify = async (req, res) => {
    try {
        const { uid, token } = req.params;
        const type = req.query.type;
        if (!isValidObjectId(uid)) throw new CustomError('Not a valid user id', 400);

        if (type === 'password-reset-verify') {

            const user = await User.findOne({ _id: uid });
            if (!user) throw new CustomError('User not found', 404);

            const passwordToken = await Token.findOne({ user_id: user._id, token, for_pass: true });
            if (!passwordToken) throw new CustomError('Not a valid OTP', 400);

            jsonResponse(res, { message: "Success" });

        } else if (type === 'email-verify') {

            const user = await User.findOne({ _id: uid });
            if (!user) throw new CustomError('Invalid OTP', 401);

            const emailVerifyToken = await Token.findOne({ user_id: user._id, token, for_pass: false });
            if (!emailVerifyToken) throw new CustomError('Invalid OTP', 400);

            await User.updateOne({ _id: user._id }, { $set: { verified: true } });
            await Token.deleteOne({ user_id: user._id, for_pass: false });

            jsonResponse(res, { message: "Email verified successfully" });
        } else {
            throw new CustomError('Invalid query parameter', 400);
        }
    } catch (error) {
        errorResponse(res, error);
    }
}

const changePassword = async (req, res) => {
    try {
        const { uid, token } = req.params;
        const { password } = req.body;
        if (!validator.isStrongPassword(password)) throw new CustomError('Password must contain a number, a special character, a capital letter, and must be 8 characters long', 400);
        if (!isValidObjectId(uid)) throw new CustomError('Invalid user id', 401);

        const user = await User.findOne({ _id: uid });
        if (!user) throw new CustomError('Unauthorized request', 401);

        const passwordToken = await Token.findOne({ user_id: user._id, token });

        if (!passwordToken) throw new CustomError('OTP has expired', 400);

        const hash = await bcrypt.hash(password, Number(process.env.SALT));

        if (user.verified) {
            await User.updateOne({ _id: user._id }, { $set: { password: hash } });
        } else {
            await User.updateOne({ _id: user._id }, { $set: { password: hash, verified: true } });
        }

        await Token.deleteOne({ user_id: user._id });

        jsonResponse(res, { message: 'Password changed successfully' });
    } catch (error) {
        errorResponse(res, error);
    }
}

const resetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!validator.isEmail(email)) throw new CustomError('Enter a valid email address', 400);

        const user = await User.findOne({ email });
        if (!user) throw new CustomError('Email not found', 404);

        const available = await Token.findOne({ user_id: user._id });
        if (available) await Token.deleteOne({ user_id: user._id });

        const token = await Token.create({ user_id: user._id, token: createOtp(), for_pass: true });

        const sent = await emailSent(token.token, email);

        if (sent) {
            jsonResponse(res, { message: "Otp sent to your email", user_id: user._id })
        } else {
            throw new CustomError('Unable to send otp to your email');
        }

    } catch (error) {
        console.log(error)
        errorResponse(res, error);
    }
}

const addOrRemoveFromCartOrWishlist = async (req, res) => {
    try {
        const { _id: userId, cart, wishlist } = req.user;
        const { _id: productId } = req.body;

        if (!isValidObjectId(productId)) throw new CustomError('Invalid product id', 400);

        const { option, add } = req.query;
        if (!option || add === undefined) throw new CustomError('Missing query parameter(s)', 400);
        if (/^(?!WISHLIST$|CART$).+$/.test(option)) throw new CustomError('\'option\' query parameter should be WISHLIST or CART', 400);
        if (/^(?!true$|false$).+$/.test(add)) throw new CustomError('\'add\' query parameter should be true or false', 400);

        var userFieldObject;

        if (option === 'WISHLIST') {
            userFieldObject = { wishlist: productId };
        } else {
            userFieldObject = { cart: productId };
        }

        if (add === 'true') {

            if (option === 'WISHLIST' && wishlist.includes(productId)) throw new CustomError('Product already added to wishlist', 400);
            if (option === 'CART' && cart.includes(productId)) throw new CustomError('Product already added to cart', 400);

            await User.updateOne({ _id: userId }, { $push: userFieldObject });
            jsonResponse(res, { message: `product added to ${option.toLowerCase()}` });

        } else {
            if (option === 'WISHLIST' && !wishlist.includes(productId)) throw new CustomError('Product already removed from wishlist', 400);
            if (option === 'CART' && !cart.includes(productId)) throw new CustomError('Product already removed from cart', 400);

            await User.updateOne({ _id: userId }, { $pull: userFieldObject });
            jsonResponse(res, { message: `product removed from ${option.toLowerCase()}` });
        }

    } catch (error) {
        errorResponse(res, error);
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const file = req.file;
        const { fullname } = req.body;

        if (!file && !fullname) throw new CustomError('Enter profile fields to update', 400);
        if (fullname.trim().length < 2) throw new CustomError('Enter a valid name', 400);

        let image_url;

        if (file) {
            const storage = getStorage(app)

            const storageRef = ref(storage, `profile_pictures/${userId}`);

            const metadata = {
                contentType: file.mimetype
            }

            const result = await uploadBytesResumable(storageRef, file.buffer, metadata);

            image_url = await getDownloadURL(result.ref);
        }

        await User.updateOne({ _id: userId }, { $set: { fullname, image_url } })

        jsonResponse(res, { message: 'Profile updated successfully' });

    } catch (error) {
        errorResponse(res, error);
    }
}


module.exports = {
    addOrRemoveFromCartOrWishlist,
    login,
    register,
    verify,
    changePassword,
    resetPassword,
    updateUserProfile
}