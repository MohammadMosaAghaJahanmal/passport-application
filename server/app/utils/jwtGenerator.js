//// ENV installition required
require("dotenv").config();
const jwt = require("jsonwebtoken");

const defaultAlgorithm = process.env.ALGORITHM || "HS256";
const defaultSecrets = process.env.SECRET || "Rg7!sH9:easyform$jR212345";
const defaultExpiresIn = 3;

function tokenGenerator(
    userId, 
    expiresIn = defaultExpiresIn,
    algorithm = defaultAlgorithm, 
    secret = defaultSecrets
    )
    {
        expiresIn += "h";
    const token = jwt.sign({userId}, secret, {
        algorithm,
        expiresIn 
    })
    return token;
}

function checkToken(token) {
    let result = {};
    try {
        result = jwt.verify(token, defaultSecrets, {algorithms: defaultAlgorithm})
        return result;
    } catch (error) {
        return null;
    };
}

module.exports = {tokenGenerator, checkToken};