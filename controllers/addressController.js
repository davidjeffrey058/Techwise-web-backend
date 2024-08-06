const { jsonResponse, errorResponse, isValidPhoneNumber } = require("../methods");
const Address = require('../models/addressModel');
const CustomError = require("../models/customError");

const getAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const address_info = await Address.findOne({ _id: userId });
        jsonResponse(res, address_info);
    } catch (error) {
        // console.log(error.message);
        errorResponse(res, error);
    }
}

const addAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const result = await Address.findOne({ _id: userId });
        if (result) throw new CustomError('Address info already exits', 400);

        const { phone_number, city, region, address } = req.body;
        // if (isValidPhoneNumber(addressInfo.phone_number)) throw new CustomError('Enter a valid phone number', 400);
        await Address.create({ _id: userId, phone_number, city, region, address });

        jsonResponse(res, { message: "Address info uploaded" });
    } catch (error) {
        errorResponse(res, error);
    }
}

const updateAddress = async (req, res) => {
    try {
        const userId = req.user._id;

        await Address.updateOne({ _id: userId }, { $set: req.body });

        jsonResponse(res, { message: 'Address info updated' });
    } catch (error) {
        errorResponse(res, error);
    }
}

module.exports = {
    getAddress,
    addAddress,
    updateAddress
}