import RNFS from 'react-native-fs';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import Share from 'react-native-share';

export const requestStoragePermission = async () => {
  try {
    if (Number(Platform.Version) >= 33) {
      return true;
    }
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    ]);

    if (
      granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.log('Storage permission granted');
      return true;
    } else if (
      granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
      granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
    ) {
      console.log('Storage permission denied with "never_ask_again" status');
      // Prompt the user to manually grant permission through device settings
      Alert.alert(
        'Permission Denied',
        'Please go to device settings and manually grant storage permission to use this feature.'
      );
      return false;
    } else {
      console.log('Storage permission denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting storage permission:', error);
    return false;
  }
};



const selectCSVFile = async () => {
  try {
    let res = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
      allowMultiSelection: false
    });
    res = res[0]
    if (res.name.endsWith('.csv')) 
      return {url: res.uri, type: "csv"};
    // else if(res.name.endsWith('.xlsx')) 
    //   return {url: res.uri, type: "xlsx"};
    else
      return Alert.alert("Info", "Incorrect Type Of File selected!")
  } catch (error) {
    if (DocumentPicker.isCancel(error)) {
      return Alert.alert("Info", "Didn't select data file!")
    } else {
      return Alert.alert("Info", error.message)

    }
  }
};



export const readCSV = async(filePath) =>
{
  const content = await RNFS.readFile(filePath, 'utf8');
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  if(headers.length !== 5)
    return Alert.alert("Failure", "Incorrect Formatted File!")
  const objects = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if(values.length !== 5)
      continue;
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      if(headers[j]?.trim() === "checked")
      {
        obj[headers[j].trim()] = Number.parseInt(values[j])
        continue;
      }
      obj[headers[j]?.trim()] = values[j]?.trim();
    }
    objects.push(obj);
  }
  return objects;
}



const shareFile = async (filePath) => {

  try {
    const options = {
      title: 'Share via',
      message: 'Share Data file',
      url: `file://${filePath}`,
    };
    await Share.open(options);
  } catch (error) {
    console.log('Error sharing file:', error);
  }
};


export const exportData = async (applications) => {
  try {
    if (!(await requestStoragePermission())) {
      Alert.alert("Permission Denied", "Without permission, you can't export data to storage");
      return;
    }
    if(applications.length <= 0)
      return Alert.alert("Info", "No Application data to export!")

    const header = 'province,barCode,date,checked,name\n';
    const csvData = applications.map(app => `${app.province},${app.barCode?.toUpperCase()},${app.date?.toUpperCase()},${app.checked ? 1 : 0},${app.name}`).join('\n');
    
    const file = '/applications.csv';
    const mainPath = RNFS.CachesDirectoryPath;
    const path = mainPath + file;
    await RNFS.writeFile(path, header + csvData, 'utf8');

    await shareFile(path)


  } catch (error) {
    console.error('Error writing file:', error);
    Alert.alert("Export Error", "An error occurred while exporting data");
  }
}

export const importData = async () => {
  try {
    if (!(await requestStoragePermission())) {
      Alert.alert("Permission Denied", "Without permission, you can't import data from storage");
      return;
    }

    let file = await selectCSVFile();
    
    if(!file?.url)
      return null;

    if(file?.type === 'csv')
      return await readCSV(file?.url);

  } catch (error) {
    console.error('Error writing file:', error);
    Alert.alert("Export Error", "An error occurred while importing data");
    return null;
  }
};;

