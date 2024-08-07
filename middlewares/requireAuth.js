const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const CustomError = require('../models/customError');
const { errorResponse } = require('../methods');

const requireAuth = async (req, res, next) => {
    try {
        const { authorization } = req.headers;

        if (!authorization) throw new CustomError('Authorization token required', 401);

        const token = authorization.split(' ')[1];

        const { _id } = jwt.verify(token, process.env.SECRET);

        const user = await User.findOne({ _id }).select('_id email cart wishlist');

        if (!user) throw new CustomError('User not found', 404);

        req.user = user;
        next();

    } catch (error) {
        errorResponse(res, error);
    }

}

module.exports = requireAuth;