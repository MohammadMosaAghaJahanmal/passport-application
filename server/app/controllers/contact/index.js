const Contact = require('../../model/Contact');
const validator = require("../../validators/contact");
const errorHandler = require("../../utils/errorHandler");
const {deleteById, updateById} = require('../../utils/CRUD') 
let errMsg = "Something Went Wrong!!";


// You Can Create New Contact

const createContact = async(req, res) =>
{
    const data = req.body;


    const {value, error} = validator(data);

    if (error) {
        return errorHandler(error, res)
    }
    
    try {
        const insertedContact = await Contact.create(value);
        res.json({status: "success", data: [insertedContact]})
    } catch (err) {
        console.log(err)
        res.json({status: "failure", message: errMsg})
    }
}

// You Can Get All Contact  

const getContact = async(req, res) =>
{
    console.log("GET")
    try {
        const getAll = await Contact.findAll();
        res.json({status: "success", data: getAll})
    } catch (err) {
        res.json({status: "failure", message: errMsg})
    }

}

// You Can Update Contact  

const updateContact = async(req, res) =>
{
    const updateData = req.body;

    let cloneUpdateData = {...updateData};

    delete cloneUpdateData.id;
    

    const {value, error} = validator(cloneUpdateData);


    if (error) {
        return errorHandler(error, res)
    }
    
        
    let contact = await Contact.findByPk(updateData.id);
    if (!contact) {
        return res.json({
            message: "Contact Doesn't exists!",
            status: "failure"
        })
    }

    try {
        contact = await updateById(updateData.id, Contact, value);
        res.json({status: "success", data: contact});
    } catch (err) {
        res.json({status: "failure", message: err.message})
    }
    

}


// You can delete Contact

const deleteContact = async(req, res) =>
{

    const {id} = req.body;

    if (!id) {
        return res.json({status: "failure", message: "Please select one to delete"});
    }
    try {
        let deleted = await deleteById(id, Contact);
        res.json({status: "success", data: deleted})
    } catch (err) {
        console.log(err)
        res.json({status: "failure", message: errMsg})
    }
}





module.exports = {
    createContact,
    getContact,
    updateContact,
    deleteContact,
}