import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
import {View, Text, StyleSheet, BackHandler, TouchableOpacity, StatusBar, Alert} from 'react-native';
import Constant, { form, searchForm } from '../../Constant';
import FullScreenLoader from '../../Components/FullScreenLoader'
import useStore from '../../store/store';
import { AuthContext } from '../../authContext';
import { deleteForm, updateForm, clearNewForms } from '../../DB';
import { deleteOne, updateOne } from '../../utils/lightCrud';
import NumberInput from '../../Components/NumberInput';
import FormsList from '../../Components/FormsList';
import serverPath from '../../utils/serverPath';
import EditNewForm from '../EditNewForm';
import { requestStoragePermission } from '../../utils/exportImportData';
import RNFS from 'react-native-fs'
import FileViewer from 'react-native-file-viewer';

const NewForms = (props) =>
{
  
  const {token, secrets} = useContext(AuthContext)
  const [globalState, dispatch] = useStore();
  const {newforms} = globalState;
  const initPagination = {
    min: 1,
    max: 1,
    page: 1,
    show: 30,
    total: 0,
    thisPageApps: []
  }
  const [pagination, setPagination] = useState({...initPagination})
  const [isLoading, setIsLoading] = useState(false);
  const [isEditApplicatio, setIsEditApplicatio] = useState({
    show: false,
    data: {}
  });


  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      max: Math.ceil(newforms.length / prev.show),
      total: newforms.length,
      thisPageApps: newforms.slice((prev.page * prev.show) - prev.show, (prev.page * prev.show))
    }));

    StatusBar.setBackgroundColor(Constant.secondary, false);
    let subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      props.onNewForms(false);
      return true;
    });
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", subscription)
  }, [newforms]);




  let onSubmit = async (data) => {
    if(data?.uxCode?.length > 0)
      return Alert.alert("Info!", "This Form Is Already Submitted You Can't Submit it again!");
       
    Alert.alert("Submit Operation!", "Are you sure to submit this application!", [
      {text: "NO", style: "cancel", },
      {text: "OKAY", style:"destructive", onPress: async () => {
        try {
          delete data.id
          delete data.status

          const baseUrl = serverPath('/easyform/application');
  
          const response = await fetch(baseUrl, {
              method: 'POST',
              headers:
              {
                "Content-Type": "Application/json",
                "Authorization": `bearer ${token}`,
              },
              body: JSON.stringify(data),
          });
          
          if(response.status === 500)
          {
            setIsLoading(false)
            Alert.alert("Info!", "The application is taking too long to submit. server will manage this.");
            return;
          }
          const objData = await response.json();
          if(objData.status === "failure")
            Alert.alert("Failure!", objData.message || "Please Try Again !");
          if(objData.status === "success")
          {
            Alert.alert("Success!", objData.message || "Successfully Changed !");
            let updatedData = {...data, uxCode: objData.data.uxCode, status: 1};
            await updateForm(updatedData);
            dispatch('setData', {type: "newforms", data: [...updateOne(newforms, data.uxSerial, updatedData, "uxSerial")]});
          }
        } catch (error) {
          alert(error.message);
      }
        setIsLoading(false)
      }}])
  }

  
  let onOpen = async (data) => {
    try {
      setIsLoading(true);
      let isGranted = await requestStoragePermission();
      if (!isGranted)
        return Alert.alert("Info", "You have to accept the permission to open the application file");
  
      const path = RNFS.CachesDirectoryPath + "/forms.html";
      await RNFS.writeFile(path, searchForm({...data, __EVENTVALIDATION: secrets.__EVENTVALIDATION, __VIEWSTATE: secrets.__VIEWSTATE}), "utf8");
      await FileViewer.open(path, "utf8")

    } catch (error) {
      console.log(error);
      Alert.alert("Info!", error.message);
    }
    setIsLoading(false);
  };



  let onDelete = async(tazkira) => {
    Alert.alert("Delete Operation!", "Are you sure to delete this application!", [
      {text: "NO", style: "cancel", },
      {text: "OKAY", style:"destructive", onPress: async () => {
        try {
          await deleteForm(tazkira)
          const deleteApp = deleteOne(newforms, tazkira, "uxSerial")
          dispatch('setData', {type: "newforms", data: [...deleteApp]});
          Alert.alert("Success", "Successfully deleted!")
        } catch (error) {
          console.log(error.message)   
          Alert.alert("Info!", error.message);
        }
      }},
    ])
    return

  }

  let onEdit = (data) => {
    if(data?.uxCode?.length > 0)
      return Alert.alert("Info!", "You Cant Edit Already Submitted Form!");
    setIsEditApplicatio({
      show: true,
      data: data
    })
  }

  const onValueChange = useCallback((page) => {
    setPagination(prev => ({
      ...prev,
      page: page,
      max: Math.ceil(newforms.length / prev.show),
      total: newforms.length,
      thisPageApps: newforms.slice((page * prev.show) - prev.show, (page * prev.show))
    }));
  }, [newforms])

  const clearNewFormsHandler = async () =>
  {
    Alert.alert("Delete Operation!", "Are you sure to delete All Applications!", [
      {text: "NO", style: "cancel", },
      {text: "OKAY", style:"destructive", onPress: async () => {
        try {
          await clearNewForms()
          dispatch('setData', {type: "newforms", data: []});
          Alert.alert("Success", "Successfully deleted!")
        } catch (error) {
          console.log(error.message)   
          Alert.alert("Info!", error.message);
        }
      }},
    ])
  }

  return (
    <>
    <View style={styles.container}>
      <View style={{...styles.row, ...styles.head}}>
        <TouchableOpacity style={{position: "absolute",zIndex: 9,right: 10}} activeOpacity={0.8} onPress={clearNewFormsHandler}>
          <Text style={{...styles.closeText, width: 36, backgroundColor: "rgba(255, 255, 255, 0.6)"}}>🗑️</Text>
        </TouchableOpacity>
        <Text style={{fontWeight: "bold", color: Constant.white, fontSize: 17}}>
          APPLICATIONS
        </Text>
        <TouchableOpacity style={styles.closeBTN} activeOpacity={0.8} onPress={()=>props.onNewForms(false)}>
          <Text style={styles.closeText}>Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.list}>
      {
        pagination.thisPageApps.length >= 1 ?
        <View style={{flex: 1}}>
          <NumberInput 
            max={pagination.max}
            page={pagination.page}
            total={pagination.total}
            thisPageApps={pagination.thisPageApps}
            onChange={onValueChange}
          />
					<FormsList
						applications={pagination.thisPageApps}
            onDelete={onDelete}
            onEdit={onEdit}
            onSubmit={onSubmit}
            onOpen={onOpen}
					/>	
        </View>
          :
          <Text style={{textAlign: "center", fontSize: 16, color: Constant.inputPrimary, marginTop: 30}}>
            No Application
          </Text>
        }
      </View>
      { isLoading &&
        <FullScreenLoader 
          style={styles.loaderScreen}
          shapeStyle={styles.shapeStyle}
        />
      }
    </View>
    { (!isLoading && isEditApplicatio.show) &&
        <EditNewForm 
          onSetEditApplication={setIsEditApplicatio}
          data={isEditApplicatio.data}
        />
      }
    </>
  )
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: Constant.whiteGreen,
    flex: 1
  },
  row: {
    flexDirection: "row"
  },
  head:
  {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    backgroundColor: Constant.secondary,
    position: "relative",
    padding: 15
  },
  closeBTN:
  {
    position: "absolute",
    zIndex: 9,
    left: 10
  },
  closeText:
  {
    fontSize: 20,
    color: Constant.inputSecondary,
    backgroundColor: Constant.whiteGreen,
    borderRadius: 50,
    width: 100,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    textAlign: "center",
    elevation: 2
  },
  list: 
  {
    flex: 1,
  },
  loaderScreen:
  {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0)",
  },
  shapeStyle:
  {
    display: "none"
  }
})


export default memo(NewForms);