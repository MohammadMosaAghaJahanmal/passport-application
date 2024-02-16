const Partner = require('../../model/Partner');
const errorHandler = require('../../utils/errorHandler');
const validator = require('../../validators/partner')
const storeImage = require('../../utils/storeImage');
const deleteImage = require('../../utils/deleteImage');
const { updateById, deleteById } = require('../../utils/CRUD');


const createPartner = async (req, res) => {
    
    const fields = req.fields;
    const file = req.file;

    let {error, value} = validator({
        ...fields,
        imagePath: file?.filePath,
    });


    if(error)
        return errorHandler(error, res);

    const {status, data, message} = await storeImage(file, {resize: true, width: 800, delTempImg: true});

    if (status === 'failure')
        return res.json({
            status: "failure",
            message: message
        });


    value.imagePath = data.dbPath;

    try {
        const insertedPartner = await Partner.create(value);

        res.json({status: "success", data: [insertedPartner]})
    } catch (error) {
        res.json({
            status: "failure",
            message: "Something went wrong !"
        })
    }
}


const updatePartner = async (req, res) => {

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
        
        let partner = await Partner.findByPk(id);
        
        if(!partner)
            return res.json({
                status: 'failure',
                message: "Partner Doesn't Exists !"
            })

        if (file?.filePath) {

            const {status, data} = await storeImage(file, {resize: true, width: 800, delTempImg: true});
            if(status === 'success')
            {
                value.imagePath = data.dbPath
                deleteImage(partner.imagePath);
            }
        }


        if(!(file?.filePath))
            value.imagePath = partner.imagePath;


        partner = await updateById(id, Partner, value);
        return res.json({status: "success", data: partner});
        
    } catch (er) {
        console.log(er.message)
        return res.json({status: "failure", message: "Something happend in updating partner"})
        
    }
}



const deletePartner = async (req, res) => {
    const {id} = req.body;

    try {
        let partner = await deleteById(id, Partner);


        if(partner)
            deleteImage(partner?.imagePath);

        res.json({status: "success", data: partner, message: "Successfully removed"})
    } catch (error) {
        res.json({
            status: "failure",
            message: "Something went wrong"
        })
    }
}




const getPartner = async (req, res) => {

    const partner = await Partner.findAll();
    res.json({status: "success", data: partner})
}



module.exports = {
    createPartner,
    deletePartner,
    getPartner,
    updatePartner,
}