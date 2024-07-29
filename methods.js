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

module.exports = {
    createToken,
    errorResponse,
    jsonResponse
}