import { Alert } from "react-native";

export const findOne = (data, value, type = "barCode") => data.find(per => per[type] == value);

export const deleteOne = (data = [], value, type = "barCode") => {
  let cloneData = [...data]
  let index = cloneData.findIndex(per => per[type] == value);
  if(index >= 0)
    cloneData.splice(index, 1)
  return cloneData;
};

export const updateOne = (data = [], id, updateData, type = "barCode") => {
  let cloneData = [...data]
  let index = cloneData.findIndex(per => per[type] == id);
  if(index >= 0)
  {
    let prevApp = cloneData[index];
    if(prevApp[type] == updateData[type])
      cloneData[index] = {...prevApp, ...updateData}
    else
    {
      let exist = cloneData.findIndex(per => per[type] == updateData[type]);
      if(exist >= 0)
      {
        Alert.alert("Info", `This ${type.toUpperCase()} Is Already Exist`);
        return cloneData; 
      }
      cloneData[index] = {...prevApp, ...updateData}
    }
  }
  return cloneData;
};