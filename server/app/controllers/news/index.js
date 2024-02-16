const News = require('../../model/News');
const Admin = require('../../model/Admin');
const errorHandler = require('../../utils/errorHandler');
const validator = require('../../validators/news')
const storeImage = require('../../utils/storeImage');
const deleteImage = require('../../utils/deleteImage');
const { updateById, deleteById, findAll } = require('../../utils/CRUD');


const createNews = async (req, res) => {
    
    const fields = req.fields;
    const file = req.file;

    let {error, value} = validator({
        ...fields,
        adminId: req?.auth?.userId?.id,
        photo: file?.filePath,
    });


    if(error)
        return errorHandler(error, res);

    const {status, data, message} = await storeImage(file, {resize: true, width: 800, delTempImg: true});
    console.log(data)

    if (status === 'failure')
        return res.json({
            status: "failure",
            message: message
        });


    value.photo = data.dbPath;

    try {
        const insertedNews = await News.create(value);
        res.json({status: "success", data: [insertedNews]})
    } catch (error) {
        res.json({
            status: "failure",
            message: "Something went wrong !"
        })
    }
}


const updateNews = async (req, res) => {

    let fields = req.fields;
    let file = req.file;

    let id = fields.id;
    delete fields.id;

    let {error, value} = validator({
        photo: file?.filePath,
        adminId: req?.auth?.userId?.id,
        ...fields,
    });
    
    if(error)
        return errorHandler(error, res);

    try {
        
        let news = await News.findByPk(id);
        
        if(!news)
            return res.json({
                status: 'failure',
                message: "News Doesn't Exists !"
            })

        if (file?.filePath) {

            const {status, data} = await storeImage(file, {resize: true, width: 800, delTempImg: true});
            if(status === 'success')
            {
                value.photo = data.dbPath
                deleteImage(news.photo);
            }
        }


        if(!(file?.filePath))
            value.photo = news.photo;


        news = await updateById(id, News, value);
        return res.json({status: "success", data: news});
        
    } catch (er) {
        console.log(er.message)
        return res.json({status: "failure", message: "Something happend in updating news"})
        
    }
}



const deleteNews = async (req, res) => {
    const {id} = req.body;

    try {
        if (!id) {
            return res.json({status: "failure", message: "Please select a News"});
        }

        let news = await deleteById(id, News);


        if(news)
            deleteImage(news?.photo);

        res.json({status: "success", data: news, message: "Successfully removed"})
    } catch (error) {
        res.json({
            status: "failure",
            message: "Something went wrong"
        })
    }

}




const getNews = async (req, res) => {

    const news = await News.findAll();
    res.json({status: "success", data: news})
}

const getNewsByAdmin = async (req, res) => {
    try {
        const news = await News.findAll({
            include: [
                {
                    model: Admin,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone', "photo"], // Specify the fields you want to retrieve
                    as: 'adminId' // Alias for the included Admin model
                }
            ]
        });
        
    res.json({status: "success", data: news})
    } catch (error) {
        res.json({
            status: "failure",
            message: "Something went wrong"
        })
    }
}



module.exports = {
    createNews,
    deleteNews,
    getNews,
    getNewsByAdmin,
    updateNews,
}