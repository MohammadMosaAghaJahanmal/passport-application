const {DataTypes, Model} = require("sequelize")
const {connection} = require('../../utils/sequelizeConnection');
class User extends Model {}

User.init({
    username: { type: DataTypes.STRING(200), allowNull: false },
    password: { type: DataTypes.STRING(200), allowNull: false },
},
{
    timestamps: true,
    sequelize: connection,
    modelName: "User",
    tableName: "users"
})


module.exports = User;
