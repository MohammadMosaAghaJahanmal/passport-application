import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
import {View, Text, StyleSheet, BackHandler, TouchableOpacity, StatusBar, Alert} from 'react-native';
import Constant, { afghanistanProvinces, form, submitFormByBrowser} from '../../Constant';
import RecyclerList from '../../Components/RecyclerList'
import FullScreenLoader from '../../Components/FullScreenLoader'
import useStore from '../../store/store';
import { AuthContext } from '../../authContext';
import { deleteApplication, updateApplication } from '../../DB';
import { deleteOne, updateOne } from '../../utils/lightCrud';
import NumberInput from '../../Components/NumberInput';
import EditApplication from '../EditApplication';
import RNFS from 'react-native-fs'
import { requestStoragePermission } from '../../utils/exportImportData';
import FileViewer from 'react-native-file-viewer'
import SearchApplication from '../SearchApplication';
const Applications = (props) =>
{
  
  const {secrets, token} = useContext(AuthContext)
  const {__EVENTVALIDATION, __VIEWSTATE} = secrets
  const [globalState, dispatch] = useStore();
  const {applications} = globalState;
  const initPagination = {
    min: 1,
    max: 1,
    page: 1,
    show: 30,
    total: 0,
    thisPageApps: []
  }
  const [pagination, setPagination] = useState({...initPagination})
	// const [ dataProvider, setDataProvider ] = useState(new DataProvider((r1, r2) => r1 !== r2));
  const [isLoading, setIsLoading] = useState(false);
  const [isEditApplicatio, setIsEditApplicatio] = useState({
    show: false,
    data: {}
  });
  const [isSearching, setIsSearching] = useState(false);


  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      max: Math.ceil(applications.length / prev.show),
      total: applications.length,
      thisPageApps: applications.slice((prev.page * prev.show) - prev.show, (prev.page * prev.show))
    }));

    StatusBar.setBackgroundColor(Constant.secondary, false);
    let subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      props.onModalChange(false);
      return true;
    });
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", subscription)
  }, [applications]);




  let onSubmit = async (data) => {
      Alert.alert("Submit Operation!", "Are you sure to submit this application!", [
        {text: "NO", style: "cancel", },
        {text: "OKAY", style:"destructive", onPress: async () => {
          try {
            data = {...data, checked: true, province: (data.province || "Kandahar")}
            setIsLoading(true)
            const {status, message} = await submitFormByBrowser({
              __EVENTVALIDATION,
              __VIEWSTATE,
              barCode: data.barCode,
              date: data.date,
              name: data.name,
              axLocationID: (afghanistanProvinces.find(per => per.province.toLowerCase() == data.province.toLowerCase())).id,
              token
            });
            if(status === "failure")
              Alert.alert("Failure!", message || "Please Try Again !");
            if(status === "success")
            {
              Alert.alert("Success!", message || "Successfully Changed !");
              await updateApplication(data);
              dispatch('setData', {type: "applications", data: [...updateOne(applications, data.barCode, data)]});
            }
          } catch (error) {
            alert(error.message);
        }
          setIsLoading(false)
        }}])

  
  }

  let onDelete = async(barCode) => {
    Alert.alert("Delete Operation!", "Are you sure to delete this application!", [
      {text: "NO", style: "cancel", },
      {text: "OKAY", style:"destructive", onPress: async () => {
        try {
          await deleteApplication(barCode)
          const deleteApp = deleteOne(applications, barCode)
          dispatch('setData', {type: "applications", data: [...deleteApp]});
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
    setIsEditApplicatio({
      show: true,
      data: data
    })
  }


  let onOpen = async (data) => {
    try {
      setIsLoading(true);

      let isGranted = await requestStoragePermission();
      if (!isGranted)
        return Alert.alert("Info", "You have to accept the permission to open the application file");
  
      const path = RNFS.CachesDirectoryPath + "/easyform.html";
      await RNFS.writeFile(path, form({...data, __EVENTVALIDATION, __VIEWSTATE}), "utf8");
      await FileViewer.open(path, "utf8")

    } catch (error) {
      console.log(error);
      Alert.alert("Info!", error.message);
    }
    setIsLoading(false);
  };


  const onValueChange = useCallback((page) => {
    setPagination(prev => ({
      ...prev,
      page: page,
      max: Math.ceil(applications.length / prev.show),
      total: applications.length,
      thisPageApps: applications.slice((page * prev.show) - prev.show, (page * prev.show))
    }));
  }, [applications])

  console.log("RENDERING APPLICATIONS")
  return (
    <>
    <View style={styles.container}>
      <View style={{...styles.row, ...styles.head}}>
        <TouchableOpacity style={{position: "absolute",zIndex: 9,right: 10}} activeOpacity={0.8} onPress={()=>setIsSearching(true)}>
          <Text style={{...styles.closeText, width: 40, backgroundColor: "rgba(255, 255, 255, 0.6)"}}>🔍</Text>
        </TouchableOpacity>
        <Text style={{fontWeight: "bold", color: Constant.white, fontSize: 17}}>
          APPLICATIONS
        </Text>
        <TouchableOpacity style={styles.closeBTN} activeOpacity={0.8} onPress={()=>props.onModalChange(false)}>
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
					<RecyclerList
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
        <EditApplication 
          onSetEditApplication={setIsEditApplicatio}
          {...isEditApplicatio.data}
        />
      }
    { (!isLoading && isSearching) &&
        <SearchApplication 
          setIsSearching={setIsSearching}
          onSetEditApplication={setIsEditApplicatio}
          onDelete={onDelete}
          onEdit={onEdit}
          onSubmit={onSubmit}
          onOpen={onOpen}
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


export default memo(Applications);