const mongoose = require("mongoose");
require("dotenv").config();

const host = process.env.HOST || "localhost";
const db = process.env.DB_NAME || "hikmathanifi";


const databaseConnaction = async (req, res, next) =>
{
    mongoose.set("strictQuery", false);
    try {
        
    // await mongoose.connect(`${host}/${db}`,
    // await mongoose.connect(`mongodb+srv://hikmathanifi:hikmathanifi123@jml.scluz7i.mongodb.net/`,
    await mongoose.connect(`mongodb+srv://hikmathanifi:hikmathanifi123@jml.scluz7i.mongodb.net/?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    
    next()
    
    
    } catch (error) {
        return res.json({
            message: "Database Error",
            status: "failure"
        });
    }
}



module.exports = databaseConnaction;