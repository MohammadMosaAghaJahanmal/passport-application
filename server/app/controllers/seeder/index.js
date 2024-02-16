const {textHasher} = require("../../utils/textHasher");
const User = require('../../model/User');
const Token = require('../../model/Token');

const USER = {
    username: "bydefault",
    password: textHasher("bydefault@1234"),

}

const seeder = async(req, res) =>
{
    try {
        await User.sync();
        await Token.sync();
        
        let newData = {};
        let user = await User.findAll();

        if(user.length <= 0)
            newData.admin = await createUser();

        
        
        res.json({status: "success", data: newData})
    } catch (err) {
        console.log(err)
        res.json({status: "failure", message: err.message})
    }
}

async function createUser ()
{
    try {
        const insertedUser = await User.create(USER);
        return {status: "success", data: insertedUser, type: 'User'}
    } catch (err) {
        return {status: "failure", message: err.message, type: 'User'}
    }
}

module.exports = {
    seeder,
}