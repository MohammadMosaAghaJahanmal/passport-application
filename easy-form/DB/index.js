// db.js

import SQLite from 'react-native-sqlite-storage';

const DB_NAME = 'easyform.db';


SQLite.DEBUG(false);
SQLite.enablePromise(true);

let db;
const initializeDB = () => {
  return new Promise((resolve, reject) => {
    SQLite.openDatabase({ name: DB_NAME, location: 'default' })
      .then(database => {
        db = database;
        resolve();
      })
      .catch(error => {
        reject(error);
      });
  });
};



const createTables = async () => {
  try {
    await db.executeSql(
      `CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        province TEXT NOT NULL,
        barCode TEXT NOT NULL UNIQUE,
        date TEXT NOT NULL,
        name TEXT NOT NULL,
        checked BOOLEAN
      )`,
      [],
    );
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS newforms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uxTitleID TEXT,
        uxCriminalRecord TEXT,
        uxFamilyNameLocal TEXT,
        uxFamilyName TEXT,
        uxGivenNamesLocal TEXT,
        uxGivenNames TEXT,
        uxFatherNameLocal TEXT,
        uxFatherName TEXT,
        uxGrandFatherNameLocal TEXT,
        uxGrandFatherName TEXT,
        uxBirthDate_Shamsi TEXT,
        uxBirthDate TEXT,
        uxProfessionID TEXT,
        _Profession TEXT,
        uxBirthLocationID TEXT,
        uxResidenceCountryID TEXT,
        uxMaritalStatusID TEXT,
        uxNIDTypeID TEXT,
        uxSerial TEXT UNIQUE,
        uxJuld TEXT,
        uxPage TEXT,
        uxNo TEXT,
        uxNID TEXT,
        uxGenderID TEXT,
        uxHairColorID TEXT,
        uxEyeColorID TEXT,
        uxBodyHeightCM INTEGER,
        status INTEGER CHECK (status IN (0, 1)),
        uxCode TEXT,
        axLocationID TEXT,
        axFullAddress TEXT,
        axPrimaryMobile TEXT,
        ucaDurationTypeID TEXT,
        ucaPaymentTypeID TEXT
      )
    `, [])
    return 
  } catch (error) {
    console.log(error.message)
    return null;
  }
};

const insertApplication = async ({province, barCode, date, name, checked}) => {
  try {
    return await db.executeSql(
      'INSERT OR IGNORE INTO applications (province, barCode, date, name, checked) VALUES (?, ?, ?, ?, ?)',
      [province, barCode?.toUpperCase(), date?.toUpperCase(), name, checked ? 1 : 0]
    );
  } catch (error) {
    console.log(error.message)
    return null;
  }
};

const clearApplications = async () => {
  try {
    await db.executeSql(
      'DELETE FROM applications',
      []
    );
    
    return 
    

  } catch (error) {
    console.log(error.message)
    return null;
  }
};

const clearNewForms = async () => {
  try {
    await db.executeSql(
      'DELETE FROM newforms',
      []
    );
    
    return 
    

  } catch (error) {
    console.log(error.message)
    return null;
  }
};

const insertManyApplications = async (applications) => {
    try {
      const values = applications.map(app => `('${app.province}', '${app.barCode?.toUpperCase()}', '${app.date?.toUpperCase()}', '${app.name}', ${app.checked ? 1 : 0})`).join(',');
      let result = await db.executeSql(
        `INSERT OR IGNORE INTO applications (province, barCode, date, name, checked) VALUES ${values}`,
        [],
      );
      return result;
    } catch (error) {
      console.log(error.message)
      return null;
    }
};

const getApplications = async () => {
  try {
    let result = await db.executeSql(
      'SELECT * FROM applications',
      []
    );
    result = result[0];
    
    return result.rows.raw()
    

  } catch (error) {
    console.log(error.message)
    return null;
  }
};

const updateApplication = async({province, barCode, date, name, checked}) => {
  try {
    return await db.executeSql(
      'UPDATE applications SET province = ?, barCode = ?, date = ?, name = ?, checked = ? WHERE barCode = ?',
      [province, barCode?.toUpperCase(), date?.toUpperCase(), name, checked ? 1 : 0, barCode],
    );
  } catch (error) {
    console.log(error.message)
      return false
  }
};

const deleteApplication = async (barCode) => {
  try {
    
    return await db.executeSql(
      'DELETE FROM applications WHERE barCode = ?',
      [barCode],
      );
      
    } catch (error) {
      console.error(error);
      return null
    }
};


const insertForm = async ({
  uxTitleID,
  uxCriminalRecord,
  uxFamilyNameLocal,
  uxFamilyName,
  uxGivenNamesLocal,
  uxGivenNames,
  uxFatherNameLocal,
  uxFatherName,
  uxGrandFatherNameLocal,
  uxGrandFatherName,
  uxBirthDate_Shamsi,
  uxBirthDate,
  uxProfessionID,
  _Profession,
  uxBirthLocationID,
  uxResidenceCountryID,
  uxMaritalStatusID,
  uxNIDTypeID,
  uxSerial,
  uxJuld,
  uxPage,
  uxNo,
  uxNID,
  uxGenderID,
  uxHairColorID,
  uxEyeColorID,
  uxBodyHeightCM,
  status,
  uxCode,
  axLocationID,
  axFullAddress,
  axPrimaryMobile,
  ucaDurationTypeID,
  ucaPaymentTypeID
}) => {
  try {
    return await db.executeSql(
      'INSERT OR IGNORE INTO newforms (uxTitleID, uxCriminalRecord, uxFamilyNameLocal, uxFamilyName, uxGivenNamesLocal, uxGivenNames, uxFatherNameLocal, uxFatherName, uxGrandFatherNameLocal, uxGrandFatherName, uxBirthDate_Shamsi, uxBirthDate, uxProfessionID, _Profession, uxBirthLocationID, uxResidenceCountryID, uxMaritalStatusID, uxNIDTypeID, uxSerial, uxJuld, uxPage, uxNo, uxNID, uxGenderID, uxHairColorID, uxEyeColorID, uxBodyHeightCM, status, uxCode, axLocationID, axFullAddress, axPrimaryMobile, ucaDurationTypeID, ucaPaymentTypeID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        uxTitleID,
        uxCriminalRecord,
        uxFamilyNameLocal,
        uxFamilyName,
        uxGivenNamesLocal,
        uxGivenNames,
        uxFatherNameLocal,
        uxFatherName,
        uxGrandFatherNameLocal,
        uxGrandFatherName,
        uxBirthDate_Shamsi,
        uxBirthDate,
        uxProfessionID,
        _Profession,
        uxBirthLocationID,
        uxResidenceCountryID,
        uxMaritalStatusID,
        uxNIDTypeID,
        uxSerial,
        uxJuld,
        uxPage,
        uxNo,
        uxNID,
        uxGenderID,
        uxHairColorID,
        uxEyeColorID,
        uxBodyHeightCM,
        status,
        uxCode,
        axLocationID,
        axFullAddress,
        axPrimaryMobile,
        ucaDurationTypeID,
        ucaPaymentTypeID
      ]
    );
  } catch (error) {
    console.log(error.message);
    return null;
  }
};

// Read operation: Get all form applications
const getForms = async () => {
  try {
    let result = await db.executeSql(
      'SELECT * FROM newforms',
      []
    );
    result = result[0];
    return result.rows.raw();
  } catch (error) {
    console.log(error.message);
    return null;
  }
};

const updateForm = async ({
  uxTitleID,
  uxCriminalRecord,
  uxFamilyNameLocal,
  uxFamilyName,
  uxGivenNamesLocal,
  uxGivenNames,
  uxFatherNameLocal,
  uxFatherName,
  uxGrandFatherNameLocal,
  uxGrandFatherName,
  uxBirthDate_Shamsi,
  uxBirthDate,
  uxProfessionID,
  _Profession,
  uxBirthLocationID,
  uxResidenceCountryID,
  uxMaritalStatusID,
  uxNIDTypeID,
  uxOldSerial,
  uxSerial,
  uxJuld,
  uxPage,
  uxNo,
  uxNID,
  uxGenderID,
  uxHairColorID,
  uxEyeColorID,
  uxBodyHeightCM,
  status,
  uxCode,
  axLocationID,
  axFullAddress,
  axPrimaryMobile,
  ucaDurationTypeID,
  ucaPaymentTypeID
}) => {
  if(!uxOldSerial)
    uxOldSerial = uxSerial;
  try {
    return await db.executeSql(
      'UPDATE newforms SET uxTitleID = ?, uxCriminalRecord = ?, uxFamilyNameLocal = ?, uxFamilyName = ?, uxGivenNamesLocal = ?, uxGivenNames = ?, uxFatherNameLocal = ?, uxFatherName = ?, uxGrandFatherNameLocal = ?, uxGrandFatherName = ?, uxBirthDate_Shamsi = ?, uxBirthDate = ?, uxProfessionID = ?, _Profession = ?, uxBirthLocationID = ?, uxResidenceCountryID = ?, uxMaritalStatusID = ?, uxNIDTypeID = ?, uxJuld = ?, uxPage = ?, uxNo = ?, uxNID = ?, uxGenderID = ?, uxHairColorID = ?, uxEyeColorID = ?, uxBodyHeightCM = ?, status = ?, uxCode = ?, axLocationID = ?, axFullAddress = ?, axPrimaryMobile = ?, ucaDurationTypeID = ?, ucaPaymentTypeID = ?, uxSerial = ? WHERE uxSerial = ?',
      [
        uxTitleID,
        uxCriminalRecord,
        uxFamilyNameLocal,
        uxFamilyName,
        uxGivenNamesLocal,
        uxGivenNames,
        uxFatherNameLocal,
        uxFatherName,
        uxGrandFatherNameLocal,
        uxGrandFatherName,
        uxBirthDate_Shamsi,
        uxBirthDate,
        uxProfessionID,
        _Profession,
        uxBirthLocationID,
        uxResidenceCountryID,
        uxMaritalStatusID,
        uxNIDTypeID,
        uxJuld,
        uxPage,
        uxNo,
        uxNID,
        uxGenderID,
        uxHairColorID,
        uxEyeColorID,
        uxBodyHeightCM,
        status,
        uxCode,
        axLocationID,
        axFullAddress,
        axPrimaryMobile,
        ucaDurationTypeID,
        ucaPaymentTypeID,
        uxSerial,
        uxOldSerial
      ]
    );
  } catch (error) {
    console.log(error.message);
    return false;
  }
};



const deleteForm = async (id) => {
  try {
    return await db.executeSql(
      'DELETE FROM newforms WHERE id = ? OR uxSerial = ?',
      [id, id]
    );
  } catch (error) {
    console.error(error);
    return null;
  }
};

export { 
  createTables,
  insertApplication,
  insertManyApplications,
  getApplications,
  updateApplication,
  deleteApplication,
  initializeDB,
  insertForm,
  updateForm,
  getForms,
  deleteForm,
  clearApplications,
  clearNewForms
};
