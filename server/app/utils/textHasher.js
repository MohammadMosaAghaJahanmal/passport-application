const bcrypt = require("bcrypt");

function textHasher(plainText) 
{
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(plainText, salt);
    return hash;
}

function hashedTextChecker(plainText, hashedText) 
{
    const isValidHash = bcrypt.compareSync(plainText, hashedText)
    return isValidHash;
}

module.exports = {textHasher, hashedTextChecker};