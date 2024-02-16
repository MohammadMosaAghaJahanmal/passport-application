const Owner = require('../../model/Owner');
const errorHandler = require('../../utils/errorHandler');
const validator = require('../../validators/owner')
const storeImage = require('../../utils/storeImage');
const deleteImage = require('../../utils/deleteImage');
const { updateById, deleteById } = require('../../utils/CRUD');


const createOwner = async (req, res) => {
    
    const fields = req.fields;
    const file = req.file;

    let {error, value} = validator({
        ...fields,
        imagePath: file?.filePath,
    });


    if(error)
        return errorHandler(error, res);

    const {status, data, message} = await storeImage(file, {resize: true, width: 200, delTempImg: true});

    if (status === 'failure')
        return res.json({
            status: "failure",
            message: message
        });


    value.imagePath = data.dbPath;

    try {
        const insertedOwner = await Owner.create(value);

        res.json({status: "success", data: [insertedOwner]})
    } catch (error) {
        res.json({
            status: "failure",
            message: "Something went wrong !" + error.message
        })
    }
}


const updateOwner = async (req, res) => {

    let fields = req.fields;
    let file = req.file;

    let id = fields.id;
    delete fields.id;

    let {error, value} = validator({
        imagePath: file?.filePath,
        ...fields,
    });
    
    if(error)
        return errorHandler(error, res);

    try {
        
        let owner = await Owner.findByPk(id);
        
        if(!owner)
            return res.json({
                status: 'failure',
                message: "Owner Doesn't Exists !"
            })

        if (file?.filePath) {

            const {status, data} = await storeImage(file, {resize: true, width: 200, delTempImg: true});
            if(status === 'success')
            {
                value.imagePath = data.dbPath
                deleteImage(owner.imagePath);
            }
        }


        if(!(file?.filePath))
            value.imagePath = owner.imagePath;


        owner = await updateById(id, Owner, value);
        return res.json({status: "success", data: owner});
        
    } catch (er) {
        console.log(er.message)
        return res.json({status: "failure", message: "Something happend in updating owner"})
        
    }
}



const deleteOwner = async (req, res) => {
    const {id} = req.body;

    try {
        let owner = await deleteById(id, Owner);


        if(owner)
            deleteImage(owner?.imagePath);

        res.json({status: "success", data: owner, message: "Successfully removed"})
    } catch (error) {
        res.json({
            status: "failure",
            message: "Something went wrong"
        })
    }
}




const getOwner = async (req, res) => {

    const owner = await Owner.findAll();
    res.json({status: "success", data: owner})
}



module.exports = {
    createOwner,
    deleteOwner,
    getOwner,
    updateOwner,
}