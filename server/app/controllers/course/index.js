const Course = require('../../model/Course');
const validator = require("../../validators/course");
const errorHandler = require("../../utils/errorHandler");
const {deleteById, updateById} = require('../../utils/CRUD') 
let errMsg = "Something Went Wrong!!";


// You Can Create New Course

const createCourse = async(req, res) =>
{
    const data = req.body;
    const {value, error} = validator(data);

    if (error) {
        return errorHandler(error, res)
    }
    try {
        const insertedCourse = await Course.create(value);
        res.json({status: "success", data: [insertedCourse]})
    } catch (err) {
        console.log(err)
        res.json({status: "failure", message: errMsg})
    }
}

// You Can Get All Course  

const getCourse = async(req, res) =>
{
    console.log("GET")
    try {
        const getAll = await Course.findAll();
        res.json({status: "success", data: getAll})
    } catch (err) {
        res.json({status: "failure", message: errMsg})
    }

}

const getUsersBelongstoCourse = async(req, res) =>
{
    const {id} = req.body;
    if(!id || id?.length <= 0 || Number.isNaN(Number.parseInt(id)))
        return res.json({status: "failure", message: "Please Enter Correct Course Id"});

    

    try {
        const getAll = await Course.getStudentsBelongsToCourse(id);
        res.json({status: "success", data: getAll})
    } catch (err) {
        console.log(err)
        res.json({status: "failure", message: errMsg})
    }

}

// You Can Update Course  

const updateCourse = async(req, res) =>
{
    const updateData = req.body;

    let cloneUpdateData = {...updateData};

    delete cloneUpdateData.id;
    
    const {value, error} = validator(cloneUpdateData);

    if (error) {
        return errorHandler(error, res)
    }
        
    let course = await Course.findByPk(updateData.id);
    if (!course) {
        return res.json({
            message: "Course Doesn't exists!",
            status: "failure"
        })
    }

    try {
        course = await updateById(updateData.id, Course, value);
        res.json({status: "success", data: course});
    } catch (err) {
        res.json({status: "failure", message: err.message})
    }
    
}


// You can delete Course

const deleteCourse = async(req, res) =>
{

    const {id} = req.body;

    if (!id) {
        return res.json({status: "failure", message: "Please select one to delete"});
    }
    try {
        let deleted = await deleteById(id, Course);
        res.json({status: "success", data: deleted})
    } catch (err) {
        console.log(err)
        res.json({status: "failure", message: errMsg})
    }
}





module.exports = {
    createCourse,
    getCourse,
    updateCourse,
    deleteCourse,
    getUsersBelongstoCourse
}