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



const createTable = async () => {
  try {
    return await db.executeSql(
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

export { createTable, insertApplication, insertManyApplications, getApplications, updateApplication, deleteApplication, initializeDB };
