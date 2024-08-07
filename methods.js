const jwt = require('jsonwebtoken');

function errorMessage(error) {
    return error.code ? error.message : 'Internal server error';
}

const createToken = (_id, expiresIn = '30d') => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: expiresIn });
}

const errorResponse = (res, error) => {
    return res.status(error.code || 500).json({ error: errorMessage(error) });
}

const jsonResponse = (res, jsonObject, statusCode = 200) => {
    return res.status(statusCode).json(jsonObject);
}

const createOtp = () => {
    let randomNumbers = '';
    for (let i = 0; i < 6; i++) {
        const number = Math.floor(Math.random() * 10);
        randomNumbers += number.toString();
    }
    return randomNumbers;
}

const isValidPhoneNumber = (phoneNumber) => {
    const ghanaPhoneRegex = /^(?:\+233|0)[23]\d{8}$/;
    return ghanaPhoneRegex.test(phoneNumber);
}



module.exports = {
    createToken,
    errorResponse,
    jsonResponse,
    createOtp,
    isValidPhoneNumber,
}