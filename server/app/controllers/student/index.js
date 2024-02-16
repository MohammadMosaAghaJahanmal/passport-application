const Student = require('../../model/Student');
const errorHandler = require('../../utils/errorHandler');
const validator = require('../../validators/student')
const storeImage = require('../../utils/storeImage');
const deleteImage = require('../../utils/deleteImage');
const { updateById, deleteById } = require('../../utils/CRUD');


const createStudent = async (req, res) => {
    
    const fields = req.fields;
    const files = req.files;
    
    let {error, value} = validator({
        ...fields,
        bioSample: files && files[0]?.filePath,
        picture: files && files[1]?.filePath,
    });
    
    if(error)
        return errorHandler(error, res);



    for (const file of files) {
        const {status, data, message} = await storeImage(file, {resize: true, width: 500, delTempImg: true});
        if (status === 'failure')
        return res.json({
            status: "failure",
            message: message
        });
        value.picture = data.dbPath;
    }



    try {
        const insertedStudent = await Student.create(value);

        res.json({status: "success", data: insertedStudent})
    } catch (error) {
        res.json({
            status: "failure",
            message: "Something went wrong !"
        })
    }
}


const updateStudent = async (req, res) => {

    let fields = req.fields;
    let files = req.files;

    let id = fields._id;
    delete fields._id;
    let {error, value} = validator({
        bioSample: files && files[0]?.filePath,
        picture: files && files[0]?.filePath,
        ...fields,
    });
    
    if(error)
        return errorHandler(error, res);

    try {
        
        const student = await Student.findByPk(id);
        
        if(!student)
            return res.json({
                status: 'failure',
                message: "Student Doesn't Exists !"
            })

        if (files && files[0]?.filePath) {
            for (const file of files) {
                    const {status, data, message} = await storeImage(file, {resize: true, width: 500, delTempImg: true});
                    if (status === 'failure')
                    return res.json({
                        status: "failure",
                        message: message
                    });
                    value.picture = data.dbPath;
                    deleteImage(student.picture);

            }
        }


        if((!files || !files[0]?.filePath))
        {
            value.picture = student.picture
            value.filePath = student.filePath
        }

        await updateById(id, Student, value)

        return res.json({status: "success", data: {...student ,...value}})
        
    } catch (er) {
        console.log(er.message)
        return res.json({status: "failure", message: "Something happend in updating student"})
        
    }
}



const deleteStudent = async (req, res) => {
    const {id} = req.body;

    try {
        let student = await deleteById(id, Student);


        if(student)
        {
            deleteImage(student.picture);
            deleteImage(student.filePath);
        }

        res.json({status: "success", data: student, message: "Successfully removed"})
    } catch (error) {
        res.json({
            status: "failure",
            message: "Something went wrong"
        })
    }
}




const getStudent = async (req, res) => {

    const student = await Student.findAll();
    res.json({status: "success", data: student})
}




module.exports = {
    createStudent,
    deleteStudent,
    getStudent,
    updateStudent,
}