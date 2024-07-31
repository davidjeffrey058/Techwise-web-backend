const User = require('../models/userModel');
const Token = require('../models/tokenModel');
const sendEmail = require('../utils/sendEmail');
const { createToken, errorResponse, jsonResponse, createOtp } = require('../methods');
const CustomError = require('../models/customError');

const emailSent = async (otp, email) => {
    return await sendEmail(email, 'Verify your email address', `Enter the following code in the application to verify your account:\n 
        ${otp}\n\n This code expires in 1 hour`);
}

const login = async (req, res) => {
    try {
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
        jsonResponse(res, { fullname: user.fullname, email: user.email, token });

    } catch (error) {
        // console.log(error.message)
        errorResponse(res, error);
    }
}

const register = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;
        const user = await User.register(fullname, email, password);

        const result = await Token.create({ user_id: user._id, token: createOtp(), for_pass: false });

        const sent = await emailSent(result.token, email);

        if (!sent) throw new CustomError("Unable to send email verification otp", 500);

        return jsonResponse(res, { message: 'Otp sent to your email please verify account' }, 201)
    } catch (error) {
        // console.log(error.message)
        errorResponse(res, error);
    }
}

const verify = async (req, res) => {
    try {
        const { email, token } = req.params;
        const type = req.query.type;

        if (type === 'password-reset-verify') {

            const user = await User.findOne({ email });
            if (!user) throw new CustomError('User not found', 404);

            const passwordToken = await Token.findOne({ user_id: user._id, token, for_pass: true });
            if (!passwordToken) throw new CustomError('Not a valid OTP', 400);

            jsonResponse(res, { message: "Success" });

        } else if (type === 'email-verify') {

            const user = await User.findOne({ email });
            if (!user) throw new CustomError('Invalid OTP', 401);

            const emailVerifyToken = await Token.findOne({ user_id: user._id, token, for_pass: false });
            if (!emailVerifyToken) throw new CustomError('Invalid OTP', 400);

            await User.updateOne({ email }, { $set: { verified: true } });
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
        const { email, token } = req.params;
        const { password } = req.body;

        const user = User.findOne({ email });

        const passwordToken = await Token.findOne({ user_id: user._id, token });
        if (!passwordToken) throw new CustomError('OTP has expired', 400);

        const hash = await bcrypt.hash(password, Number(process.env.SALT));

        if (user.verified) {
            await User.updateOne({ email }, { $set: { password: hash } });
        } else {
            await User.updateOne({ email }, { $set: { password: hash, verified: true } });
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

        const user = await User.findOne({ email });
        if (!user) throw new CustomError('Email not found', 404);

        var token = await Token.findOne({ user_id: user._id });

        if (token) await Token.deleteOne({ user_id: user._id });

        token = await Token.create({ email, token: createOtp() });

        if (await emailSent(token.token, email)) {
            jsonResponse(res, { message: "Otp sent to your email" })
        } else {
            throw new CustomError('Unable to send otp to your email');
        }

    } catch (error) {
        // console.log(error)
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
    register,
    verify,
    changePassword,
    resetPassword
}