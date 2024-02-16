const {hashedTextChecker} = require("./textHasher");
const {tokenGenerator} = require("./jwtGenerator");
const User = require("../model/User");




const authenticate = async (req, res, next) =>
{
    const {password, username} = req.body;

    console.log("_____BACKEND______");
    if ((!password || !username) || (!username.trim() || !password.trim())) {
        return res.json({
            status: "failure",
            message: "Please Fill The Inputs",
        })
    }
    
    
    
    const user = await User.findOne({where: { username: username }});

    if (!user) {
        return res.json({
            message: "Please Enter Correct username Or Password",
            status: "failure"
        })
    }
    let pass = hashedTextChecker(password, user.password)
    
    if (!pass) {
        return res.json({
            message: "Please Enter Correct username Or Password",
            status: "failure"
        })
    }

    const token = tokenGenerator({admin: user.id}, 24);

    user.password = null;

    try {
        
        res.json({
            token,
            user,
            status: "success",
        })

    } catch (error) {
        return res.json({status: "failure", message: "Please Login Again"})
    }
}


const loginAsToken = async (req, res) =>
{
    
    const {admin} = req.auth.userId;
    try {
    const user = await User.findOne({
        where: { id: admin },
        attributes: { exclude: ['password'] }
    });
    if(!user)
        return res.json({
            message: "Please Login To Your Account",
            status: "failure"
        })

    const status = "success";

        res.json({
            status,
            user
        });
    } catch (error) {
        return res.json({status: "failure", message: "Please Login To Your Account"})
    }

}


module.exports = {authenticate, loginAsToken}
