const CourseArrangement = require('../../model/CourseArrangement');
const validator = require("../../validators/courseArrangement");
const errorHandler = require("../../utils/errorHandler");
const {deleteById, updateById} = require('../../utils/CRUD') 
let errMsg = "Something Went Wrong!!";


// You Can Create New CourseArrangement

const createCourseArrangement = async(req, res) =>
{
    const data = req.body;
    const {value, error} = validator(data);

    if (error) {
        return errorHandler(error, res)
    }
    try {
        const insertedCourseArrangement = await CourseArrangement.create(value);
        res.json({status: "success", data: [insertedCourseArrangement]})
    } catch (err) {
        console.log(err)
        res.json({status: "failure", message: errMsg})
    }
}

// You Can Get All CourseArrangement  

const getCourseArrangement = async(req, res) =>
{
    console.log("GET")
    try {
        const getAll = await CourseArrangement.findAll();
        res.json({status: "success", data: getAll})
    } catch (err) {
        res.json({status: "failure", message: errMsg})
    }

}

const arrangementQuery = async(req, res) =>
{
    try {
        const getAll = await CourseArrangement.findOne({
            where: req.body
        });
        res.json({status: "success", data: getAll})
    } catch (err) {
        res.json({status: "failure", message: errMsg})
    }

}


// You Can Update CourseArrangement  

const updateCourseArrangement = async(req, res) =>
{
    const updateData = req.body;

    let cloneUpdateData = {...updateData};

    delete cloneUpdateData.id;
    
    const {value, error} = validator(cloneUpdateData);

    if (error) {
        return errorHandler(error, res)
    }
        
    let courseArrangement = await CourseArrangement.findByPk(updateData.id);
    if (!courseArrangement) {
        return res.json({
            message: "CourseArrangement Doesn't exists!",
            status: "failure"
        })
    }

    try {
        courseArrangement = await updateById(updateData.id, CourseArrangement, value);
        res.json({status: "success", data: courseArrangement});
    } catch (err) {
        res.json({status: "failure", message: err.message})
    }
    
}


// You can delete CourseArrangement

const deleteCourseArrangement = async(req, res) =>
{

    const {id} = req.body;

    if (!id) {
        return res.json({status: "failure", message: "Please select one to delete"});
    }
    try {
        let deleted = await deleteById(id, CourseArrangement);
        res.json({status: "success", data: deleted})
    } catch (err) {
        console.log(err)
        res.json({status: "failure", message: errMsg})
    }
}





module.exports = {
    createCourseArrangement,
    getCourseArrangement,
    updateCourseArrangement,
    deleteCourseArrangement,
    arrangementQuery
}