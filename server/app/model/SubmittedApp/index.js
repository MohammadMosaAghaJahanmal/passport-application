const {DataTypes, Model} = require("sequelize")
const {connection} = require('../../utils/sequelizeConnection');
const Token = require("../Token");
class SubmittedApp extends Model {}

SubmittedApp.init({
    name: { type: DataTypes.STRING(50), allowNull: true },
    uxBirthDate: { type: DataTypes.STRING(20), allowNull: false },
    uxCode: { type: DataTypes.STRING(30), allowNull: false },
    axLocationID: { type: DataTypes.STRING(5), allowNull: false },
    tokenId: { 
        type: DataTypes.INTEGER, 
        allowNull: true, 
        references: {
            model: Token,
            key: "id",
        }
    },
},
{
    timestamps: true,
    sequelize: connection,
    modelName: "SubmittedApp",
    tableName: "submittedapps"
});

SubmittedApp.belongsTo(Token, { foreignKey: 'tokenId', as: "token" });


module.exports = SubmittedApp;
