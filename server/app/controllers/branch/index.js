const Branch = require('../../model/Branch');
const validator = require("../../validators/branch");
const errorHandler = require("../../utils/errorHandler");
const {deleteById, updateById} = require('../../utils/CRUD') 
let errMsg = "Something Went Wrong!!";


// You Can Create New Branch

const createBranch = async(req, res) =>
{
    const data = req.body;

    console.log("POST")

    const {value, error} = validator(data);

    if (error) {
        return errorHandler(error, res)
    }
    
    try {
        const insertedBranch = await Branch.create(value);
        res.json({status: "success", data: [insertedBranch]})
    } catch (err) {
        console.log(err)
        res.json({status: "failure", message: errMsg})
    }
}

// You Can Get All Branch  

const getBranch = async(req, res) =>
{
    console.log("GET")
    try {
        const getAll = await Branch.findAll();
        res.json({status: "success", data: getAll})
    } catch (err) {
        res.json({status: "failure", message: errMsg})
    }

}

// You Can Update Branch  

const updateBranch = async(req, res) =>
{
    const updateData = req.body;

    let cloneUpdateData = {...updateData};

    delete cloneUpdateData.id;
    

    const {value, error} = validator(cloneUpdateData);


    if (error) {
        return errorHandler(error, res)
    }
    
        
    let branch = await Branch.findByPk(updateData.id);
    if (!branch) {
        return res.json({
            message: "Branch Doesn't exists!",
            status: "failure"
        })
    }

    try {
        branch = await updateById(updateData.id, Branch, value);
        res.json({status: "success", data: branch});
    } catch (err) {
        res.json({status: "failure", message: err.message})
    }
    

}


// You can delete Branch

const deleteBranch = async(req, res) =>
{

    const {id} = req.body;

    if (!id) {
        return res.json({status: "failure", message: "Please select one to delete"});
    }
    try {
        let deleted = await deleteById(id, Branch);
        res.json({status: "success", data: deleted})
    } catch (err) {
        console.log(err)
        res.json({status: "failure", message: errMsg})
    }
}





module.exports = {
    createBranch,
    getBranch,
    updateBranch,
    deleteBranch,
}