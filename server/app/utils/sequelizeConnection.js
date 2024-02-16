const {Sequelize} = require("sequelize");
require("dotenv").config();

const HOST = process.env.HOST || "localhost";
const DB_NAME = process.env.DB_NAME || "jahanmal_easyform";
const DB_USER = process.env.DB_USER || "jahanmal_easyform";
const DB_PASSWORD = process.env.DB_PASSWORD;

const connection = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: HOST,
    dialect: 'mysql',
    define:{
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci', 
      timestamps: true
    }
  });


const test = async (req, res, next) =>
{
    
    try {
        await connection.authenticate();
        return "Connection has been established successfully"
      } catch (error) {
        return ('Unable to connect to the database:' + error)
      }
}



module.exports = {test, connection};