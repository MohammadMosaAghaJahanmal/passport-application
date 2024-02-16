const User = require('../../model/User');
const errorHandler = require('../../utils/errorHandler');
const validator = require('../../validators/user')
const isUnique = require("../../utils/isUnique");
const {textHasher, hashedTextChecker} = require("../../utils/textHasher");


const createUser = async (req, res) => {
    
    const fields = req.fields;
    
    let {error, value} = validator({
        ...fields,
    });
    
    if(error)
        return errorHandler(error, res);

    try {
        if(!(await isUnique(User, 'email', value.email)))
            return res.json({
                status: "failure",
                message: "This User is already exists!"
            })
    } catch (er) {
        res.json({
            status: "failure",
            message: er.message
        })
    }

    
    value.unhashed = value.password;
    value.password  = textHasher(value.password)


    try {
        const insertedUser = await User.insertMany(value);

        res.json({status: "success", data: insertedUser})
    } catch (error) {
        res.json({
            status: "failure",
            message: "Something went wrong !"
        })
    }
}








const findUser = async (req, res) => {
    const userData = req.body
    const user = await User.findById(userData.id);
    res.json(user)
}


const updateUser = async (req, res) => {

    const logedinUser = req.auth.userId;

    const fields = req.fields;

    let id = fields.id;
    delete fields.id;

    if(logedinUser?.id !== id && logedinUser.role !== 'admin')
        return res.json({status: "failure", message: "Access Denied to update profile !"});


    let {error, value} = validator({
        ...fields,
    });
    
    if(error)
        return errorHandler(error, res);

    try {
        
        const user = await User.findById(id);
        
        if(!user)
            return res.json({
                status: 'failure',
                message: "User Doesn't Exists"
            })
        // value.email = user.email;
        if(user.role === "admin") 
            value.role = "admin";

        if(value.email !== user.email)
        {
            if(!(await isUnique(User, 'email', value.email)))
                return res.json({
                    status: "failure",
                    message: "This User is already exists!"
                })
        }
        
        let isTrue = hashedTextChecker(value.password, user.password);
        if(!isTrue)
        {
            value.unhashed = value.password;
            value.password  = textHasher(value.password)
        }

        if(isTrue)
            delete value.password

        await User.updateOne({_id: id}, {$set: value});

        let cloneValue = {...user._doc, ...value};

        delete cloneValue.password;
        delete cloneValue.unhashed;


        return res.json({status: "success", data: {...cloneValue}})
        
    } catch (er) {
        console.log(er.message)
        return res.json({status: "failure", message: "Something happend in updating user"})
        
    }
}



const deleteUser = async (req, res) => {
    const {id} = req.body;

    try {
        const user = await User.findByIdAndDelete(id);

        res.json({status: "success", data: user, message: "Successfully removed"})
    } catch (error) {
        res.json({
            status: "failure",
            message: "Something went wrong"
        })
    }
}




const getUsers = async (req, res) => {
    const query = {};

    if(req?.tokenUser?.id && req?.tokenUser?.role === "admin") query._id = req?.tokenUser?.id;

    const users = await User.find(query, ['-password', '-unhashed']);
    res.json({status: "success", data: users})
}



module.exports = {
    createUser,
    findUser,
    deleteUser,
    getUsers,
    updateUser,
}