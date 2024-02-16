const Token = require('../../model/Token');
const validator = require("../../validators/token");
const errorHandler = require("../../utils/errorHandler");
const {deleteById, updateById} = require('../../utils/CRUD'); 
const { tokenGenerator } = require('../../utils/jwtGenerator');
let errMsg = "Something Went Wrong!!";


// You Can Create New Token

const createToken = async(req, res) =>
{
	try {

	const {expireOn} = req.body;
	if(!expireOn || expireOn?.length <= 0)
		return res.json({status: "failure", data: "Expire date is requred"});
		let changeToNumber = Number.parseInt(expireOn);
		if(isNaN(changeToNumber))
			return res.json({status: "failure", data: "Please Enter Correct Date Value"});
		
		let createExpiry = (changeToNumber * 24 * 60 * 60 * 1000)

		let expiryOnDate = (new Date().getTime() + createExpiry);

		let insertToken = await Token.create({expireOn: expiryOnDate, token: "notapplicaple"});

		let createToken = tokenGenerator({tokenId: insertToken.id}, (changeToNumber * 24));

		let createdToken = await updateById(insertToken.id, Token, {token: createToken})

		res.json({status: "success", data: createdToken})
	} catch (err) {
		console.log(err)
		res.json({status: "failure", message: errMsg})
	}
}

// You Can Get All Token  

const getToken = async(req, res) =>
{
    try {
        const getAll = await Token.findAll();
        res.json({status: "success", data: getAll})
    } catch (err) {
        res.json({status: "failure", message: errMsg})
    }
}

const getOneToken = async(req, res) =>
{
    try {
        const getOne = await Token.findOne({
            where: {...req.body}
        });
        res.json({status: "success", data: getOne})
    } catch (err) {
        res.json({status: "failure", message: errMsg})
    }
}

// You Can Update Token  

const updateToken = async(req, res) =>
{
    const updateData = req.body;

    let cloneUpdateData = {...updateData};

    delete cloneUpdateData.id;

    const {value, error} = validator(cloneUpdateData);
    if (error) {
        return errorHandler(error, res)
    }
    let token = await Token.findByPk(updateData.id);
    if (!token) {
        return res.json({
            message: "Token Doesn't exists!",
            status: "failure"
        })
    }
    try {
        token = await updateById(updateData.id, Token, value);
        res.json({status: "success", data: token});
    } catch (err) {
        res.json({status: "failure", message: err.message})
    }
}


// You can delete Token

const deleteToken = async(req, res) =>
{

    const {id} = req.body;

    if (!id) {
        return res.json({status: "failure", message: "Please select one to delete"});
    }
    try {
        let deleted = await deleteById(id, Token);
        res.json({status: "success", data: deleted})
    } catch (err) {
        console.log(err)
        res.json({status: "failure", message: errMsg})
    }
}





module.exports = {
    createToken,
    getToken,
    updateToken,
    deleteToken,
    getOneToken
}