const Static = require('../../model/Static');
const validator = require("../../validators/static");
const errorHandler = require("../../utils/errorHandler");
const {deleteById, updateById} = require('../../utils/CRUD') 
let errMsg = "Something Went Wrong!!";


// You Can Create New Static

const createStatic = async(req, res) =>
{
    const data = req.body;

    console.log("POST")

    const {value, error} = validator(data);

    if (error) {
        return errorHandler(error, res)
    }
    
    try {
        const insertedStatic = await Static.create(value);
        res.json({status: "success", data: [insertedStatic]})
    } catch (err) {
        console.log(err)
        res.json({status: "failure", message: errMsg})
    }
}

// You Can Get All Static  

const getStatic = async(req, res) =>
{
    console.log("GET")
    try {
        const getAll = await Static.findAll();
        res.json({status: "success", data: getAll})
    } catch (err) {
        res.json({status: "failure", message: errMsg})
    }

}

// You Can Update Static  

const updateStatic = async(req, res) =>
{
    const updateData = req.body;

    let cloneUpdateData = {...updateData};

    delete cloneUpdateData.id;
    

    const {value, error} = validator(cloneUpdateData);


    if (error) {
        return errorHandler(error, res)
    }
    
        
    let static = await Static.findByPk(updateData.id);
    if (!static) {
        return res.json({
            message: "Static Doesn't exists!",
            status: "failure"
        })
    }

    try {
        static = await updateById(updateData.id, Static, value);
        res.json({status: "success", data: static});
    } catch (err) {
        res.json({status: "failure", message: err.message})
    }
    

}


// You can delete Static

const deleteStatic = async(req, res) =>
{

    const {id} = req.body;

    if (!id) {
        return res.json({status: "failure", message: "Please select one to delete"});
    }
    try {
        let deleted = await deleteById(id, Static);
        res.json({status: "success", data: deleted})
    } catch (err) {
        console.log(err)
        res.json({status: "failure", message: errMsg})
    }
}





module.exports = {
    createStatic,
    getStatic,
    updateStatic,
    deleteStatic,
}