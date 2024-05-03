// Import Sequelize library and connection
const { DataTypes, Model } = require('sequelize');
const { connection } = require('../../utils/sequelizeConnection');
const Token = require('../Token');

class NewForm extends Model {}

NewForm.init(
  {
    uxTitleID: {type: DataTypes.STRING, allowNull: true},
    uxCriminalRecord: {type: DataTypes.STRING, allowNull: true},
    uxFamilyNameLocal: {type: DataTypes.STRING, allowNull: true},
    uxFamilyName: {type: DataTypes.STRING, allowNull: true},
    uxGivenNamesLocal: {type: DataTypes.STRING, allowNull: true},
    uxGivenNames: {type: DataTypes.STRING, allowNull: true},
    uxFatherNameLocal: {type: DataTypes.STRING, allowNull: true},
    uxFatherName: {type: DataTypes.STRING, allowNull: true},
    uxGrandFatherNameLocal: {type: DataTypes.STRING, allowNull: true},
    uxGrandFatherName: {type: DataTypes.STRING, allowNull: true},
    uxBirthDate_Shamsi: {type: DataTypes.STRING, allowNull: true},
    uxBirthDate: {type: DataTypes.STRING, allowNull: true},
    uxProfessionID: {type: DataTypes.STRING, allowNull: true},
    _Profession: {type: DataTypes.STRING, allowNull: true},
    uxBirthLocationID: {type: DataTypes.STRING, allowNull: true},
    uxResidenceCountryID: {type: DataTypes.STRING, allowNull: true},
    axLocationID: {type: DataTypes.STRING, allowNull: true},
    uxMaritalStatusID: {type: DataTypes.STRING, allowNull: true},
    uxNIDTypeID: {type: DataTypes.STRING, allowNull: true},
    uxSerial: {type: DataTypes.STRING, allowNull: true},
    uxJuld: {type: DataTypes.STRING, allowNull: true},
    uxPage: {type: DataTypes.STRING, allowNull: true},
    uxNo: {type: DataTypes.STRING, allowNull: true},
    uxNID: {type: DataTypes.STRING, allowNull: true},
    uxGenderID: {type: DataTypes.STRING, allowNull: true},
    uxHairColorID: {type: DataTypes.STRING, allowNull: true},
    uxEyeColorID: {type: DataTypes.STRING, allowNull: true},
    uxBodyHeightCM: {type:DataTypes.INTEGER, allowNull: true},
    isChanged: {type: DataTypes.BOOLEAN, defaultValue: false},
    status: DataTypes.INTEGER,
    uxCode: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
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
    sequelize: connection,
    modelName: 'NewForm',
    tableName: 'newforms',
    timestamps: true,
  }
);
NewForm.belongsTo(Token, { foreignKey: 'tokenId', as: "token" });


module.exports = NewForm;
