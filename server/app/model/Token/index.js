const {DataTypes, Model} = require("sequelize")
const {connection} = require('../../utils/sequelizeConnection')

class Token extends Model {}

Token.init({
    token: {type: DataTypes.STRING, allowNull: false, unique: true},
    deviceInfo: {type: DataTypes.STRING, allowNull: true},
    phone: {type: DataTypes.STRING(15), allowNull: true},
    expireOn: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.DATE},
    status: {type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true},
    employeeId: {type: DataTypes.INTEGER, allowNull: true},
},
{
    timestamps: true,
    sequelize: connection,
    modelName: "Token",
    tableName: "tokens"
});


module.exports = Token;