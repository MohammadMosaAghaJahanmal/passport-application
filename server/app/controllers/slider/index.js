const Slider = require('../../model/Slider');
const errorHandler = require('../../utils/errorHandler');
const validator = require('../../validators/slider')
const storeImage = require('../../utils/storeImage');
const deleteImage = require('../../utils/deleteImage');
const { updateById, deleteById } = require('../../utils/CRUD');


const createSlider = async (req, res) => {
    
    const file = req.file;

    let {error, value} = validator({
        imagePath: file?.filePath,
    });


    if(error)
        return errorHandler(error, res);

    const {status, data, message} = await storeImage(file, {resize: true, width: 1920, delTempImg: true});

    if (status === 'failure')
        return res.json({
            status: "failure",
            message: message
        });


    value.imagePath = data.dbPath;

    try {
        const insertedSlider = await Slider.create(value);

        res.json({status: "success", data: [insertedSlider]})
    } catch (error) {
        res.json({
            status: "failure",
            message: "Something went wrong !"
        })
    }
}


const updateSlider = async (req, res) => {

    let fields = req.fields;
    let file = req.file;

    let id = fields.id;
    delete fields.id;

    let {error, value} = validator({
        imagePath: file?.filePath,
    });
    
    if(error)
        return errorHandler(error, res);

    try {
        
        let slider = await Slider.findByPk(id);
        
        if(!slider)
            return res.json({
                status: 'failure',
                message: "Slider Doesn't Exists !"
            })

        if (file?.filePath) {

            const {status, data} = await storeImage(file, {resize: true, width: 1920, delTempImg: true});
            if(status === 'success')
            {
                value.imagePath = data.dbPath
                deleteImage(slider.imagePath);
            }
        }


        if(!(file?.filePath))
            value.imagePath = slider.imagePath;


        slider = await updateById(id, Slider, value);
        return res.json({status: "success", data: slider});
        
    } catch (er) {
        console.log(er.message)
        return res.json({status: "failure", message: "Something happend in updating slider"})
        
    }
}



const deleteSlider = async (req, res) => {
    const {id} = req.body;

    try {
        let slider = await deleteById(id, Slider);


        if(slider)
            deleteImage(slider?.imagePath);

        res.json({status: "success", data: slider, message: "Successfully removed"})
    } catch (error) {
        res.json({
            status: "failure",
            message: "Something went wrong"
        })
    }
}




const getSlider = async (req, res) => {

    const slider = await Slider.findAll();
    res.json({status: "success", data: slider})
}



module.exports = {
    createSlider,
    deleteSlider,
    getSlider,
    updateSlider,
}