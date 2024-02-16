const Admin = require('../../model/Admin');
const Role = require('../../model/Role');
const errorHandler = require('../../utils/errorHandler');
const validator = require('../../validators/admin')
const storeImage = require('../../utils/storeImage');
const deleteImage = require('../../utils/deleteImage');
const { updateById, deleteById, findAll } = require('../../utils/CRUD');
const { hashedTextChecker, textHasher } = require('../../utils/textHasher');


const createAdmin = async (req, res) => {
    
    const fields = req.fields;
    const file = req.file;
    let {error, value} = validator({
        ...fields,
        roleId: 0,
        image: file?.filePath,
    });


    if(error)
        return errorHandler(error, res);

    
    const insertRole = await Role.create({name: "co admin", permissions: {"pages": "-"}});
    if(!insertRole)
        return res.json({
            status: "failure",
            message: "Something happend with creating roles for the admin"
        });

    value.roleId = insertRole.id;
    const {status, data, message} = await storeImage(file, {resize: true, width: 800, delTempImg: true});

    if (status === 'failure')
        return res.json({
            status: "failure",
            message: message
        });


    value.image = data.dbPath;
    value.password = textHasher(value.password);

    try {
        const insertedAdmin = await Admin.create(value);

        res.json({status: "success", data: [insertedAdmin]})
    } catch (error) {
        res.json({
            status: "failure",
            message: "Something went wrong !"
        })
    }
}


const updateProfile = async (req, res) => {

    let fields = req.fields;
    let file = req.file;
    let id = req?.auth?.userId?.id;

    console.log(fields.id);
    console.log(id);

    if(fields.id != id)
        return res.json({
            status: 'failure',
            message: "Access Denied To Change Profile!"
        });


    delete fields.id;
    delete fields.createdAt;
    delete fields.updatedAt;

    const prevPassword = fields.prevPassword;
    const newPassword = fields.newPassword

    delete fields.prevPassword;
    delete fields?.newPassword;

    let {error, value} = validator({
        image: file?.filePath,
        password: prevPassword,
        ...fields,
    });
    
    delete value.status;
    delete value.password;
    delete value.roleId;

    if(error)
        return errorHandler(error, res);

    try {
        
        let admin = await Admin.findByPk(id);
        
        if(!admin)
            return res.json({
                status: 'failure',
                message: "Admin Doesn't Exists !"
            });

        
        let pass = hashedTextChecker(prevPassword, admin.password)
        
        if (!pass) {
            return res.json({
                message: "Please Enter Correct Previous Password",
                status: "failure"
            })
        }


        if (file?.filePath) {

            const {status, data} = await storeImage(file, {resize: true, width: 800, delTempImg: true});
            if(status === 'success')
            {
                value.image = data.dbPath
                if(admin.image)
                    deleteImage(admin.image);
            }
        }


        if(!(file?.filePath))
            value.image = admin.image;

        if(newPassword)
            value.password = textHasher(newPassword)

        admin = await updateById(id, Admin, value);
        return res.json({status: "success", data: admin});
        
    } catch (er) {
        console.log(er.message)
        return res.json({status: "failure", message: "Something happend in updating admin"})
        
    }
}

const updateAdmin = async (req, res) => {

    let fields = req.fields;
    let file = req.file;
    let id = fields.id;

    delete fields.id;
    delete fields.createdAt;
    delete fields.updatedAt;

    let {error, value} = validator({
        image: file?.filePath,
        password: "defaultpassword",
        roleId: 0,
        ...fields,
    });
    

    if(error)
        return errorHandler(error, res);

        delete value.roleId;

    try {
        let admin = await Admin.findByPk(id);
        
        if(!admin)
            return res.json({
                status: 'failure',
                message: "Admin Doesn't Exists !"
            });
        
        if (file?.filePath) {

            const {status, data} = await storeImage(file, {resize: true, width: 800, delTempImg: true});
            if(status === 'success')
            {
                value.image = data.dbPath
                if(admin.image)
                    deleteImage(admin.image);
            }
        }


        if(!(file?.filePath))
            value.image = admin.image;

        if(fields.password)
            value.password = textHasher(fields.password);

        if(!fields.password)
            delete value.password

        admin = await updateById(id, Admin, value);
        return res.json({status: "success", data: admin});
        
    } catch (er) {
        console.log(er.message)
        return res.json({status: "failure", message: "Something happend in updating admin"})
        
    }
}



const deleteAdmin = async (req, res) => {
    const {id} = req.body;

    try {
        if (!id) {
            return res.json({status: "failure", message: "Please select a Admin"});
        }

        let admin = await deleteById(id, Admin);


        if(admin)
            deleteImage(admin?.image);

        res.json({status: "success", data: admin, message: "Successfully removed"})
    } catch (error) {
        res.json({
            status: "failure",
            message: "Something went wrong"
        })
    }

}




const getAdmins = async (req, res) => {

    const admin = await Admin.findAll({
        attributes: { exclude: ['password'] 
    }
    });
    res.json({status: "success", data: admin})
}

const getAdminsByAdmin = async (req, res) => {
    try {
        const admins = await Admin.findAll({
            include: [
                {
                    model: Admin,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone', "image"], // Specify the fields you want to retrieve
                    as: 'adminId' // Alias for the included Admin model
                }
            ]
        });
        
    res.json({status: "success", data: admins})
    } catch (error) {
        res.json({
            status: "failure",
            message: "Something went wrong"
        })
    }
}



module.exports = {
    createAdmin,
    deleteAdmin,
    getAdmins,
    getAdminsByAdmin,
    updateAdmin,
    updateProfile,
}