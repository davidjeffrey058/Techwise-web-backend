const Users = require('../models/userModel');
const { errorResponse } = require('../methods');
const CustomError = require('../models/customError');

const isAdmin = async (req, res, next) => {
    try {
        const { _id } = req.user;
        // console.log(id)
        const user = await Users.findOne({ _id });

        if (!user) throw new CustomError('User not found', 404);

        if (user.is_admin) return next();

        throw new CustomError('Unauthorized request', 401);
    } catch (error) {
        errorResponse(res, error);
    }
}

module.exports = isAdmin;