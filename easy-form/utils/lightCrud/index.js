import { Alert } from "react-native";

export const findOne = (data, barCode) => data.find(per => per?.barCode == barCode);

export const deleteOne = (data = [], barCode) => {
  let cloneData = [...data]
  let index = cloneData.findIndex(per => per.barCode == barCode);
  if(index >= 0)
    cloneData.splice(index, 1)
  return cloneData;
};

export const updateOne = (data = [], barCode, updateData) => {
  let cloneData = [...data]
  let index = cloneData.findIndex(per => per.barCode == barCode);
  if(index >= 0)
  {
    let prevApp = cloneData[index];
    if(prevApp.barCode == updateData.barCode)
      cloneData[index] = {...prevApp, ...updateData}
    else
    {
      let exist = cloneData.findIndex(per => per.barCode == updateData.barCode);
      if(exist >= 0)
      {
        Alert.alert("Info", "This Bar Code Is Already Exist");
        return cloneData; 
      }
      cloneData[index] = {...prevApp, ...updateData}
    }
  }
  return cloneData;
};