const crypto = require('crypto');

const createToken = () => {
    return crypto.randomInt(100000, 999999).toString();
};

const isTokenExpired = (expiry) => {
    return new Date() > expiry;
};

module.exports = { createToken, isTokenExpired };
