import React, { useContext, useEffect, useState } from 'react';
import {View, Text, StyleSheet, StatusBar, ScrollView, Alert, TouchableOpacity, Linking} from 'react-native';
import { AuthContext } from '../../authContext';
import Constant  from '../../Constant';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import extractKeysFromHTML from '../../utils/extractKeysFromHTML';
import fetchApi from '../../utils/nativeRequest'
import { setProvince, setSecrets } from '../../LocalStorage';
import { getApplications, insertApplication, insertManyApplications } from '../../DB';
import useStore from '../../store/store';
import {findOne} from '../../utils/lightCrud';
import {exportData, importData} from '../../utils/exportImportData';
import serverPath from '../../utils/serverPath';
const Forms = (props) =>
{

  const {setAuth, token} = useContext(AuthContext)
  const [globalState, dispatch] = useStore();
  const {applications, provinces} = globalState;
  const [isLoading, setIsLoading] = useState(false);
  const initFieldsState = {
    barCode: "",
    date: "",
    name: "",
    // barCode: "P31022010230124001",
    // date: "1388/11/18",
    // name: "DUMMY",
  };
  const [fields, setFields] = useState({...initFieldsState})
  const setFieldHandler = (value, type) => (isLoading || setFields(prev => ({...prev, [type] : value})))

  useEffect(() => {
    StatusBar.setBackgroundColor(Constant.whiteGreen, true)
  }, [])

  const loadKeyhandler = async () => 
  {
    try {
    setIsLoading(true)

    const response = await fetchApi('https://passport.moi.gov.af/BarcodeSearch/')
    const text = await response.text();
    const secrt = extractKeysFromHTML(text);
    if(!secrt.__EVENTVALIDATION || !secrt.__VIEWSTATE)
    {
      setIsLoading(false);
      return Alert.alert("Failure !", "Please Try Again!");
    }
    
    await setSecrets(secrt);

    setAuth(prev => ({...prev, secrets:secrt}));
    
    Alert.alert("Success", "Form Successfully Validated!")
    
    } catch (error) {
      Alert.alert("ERROR !", "Please Try Again!");
      console.log(error, "ERR")
    }
    setIsLoading(false);
  }
  
  const saveFormHandler = async () => 
  {
    const {name, date, barCode} = fields;

    if(barCode.length <= 0)
      return Alert.alert("Info!", "BarCode Input Is Required!");
    if(date.length <= 0)
      return Alert.alert("Info!", "Date Input Is Required!");
    if(name.length <= 0)
      return Alert.alert("Info!", "Name Input Is Required!");

    let exist = findOne(applications, barCode)
    if(exist)
      return Alert.alert("Info!", "This Barcode is already exist!");
      let newApp = {
        name, 
        barCode, 
        date, 
        checked: false, 
        province: "Kandahar"
      }
    const updateClone = [
      ...applications, 
      newApp
    ]
    dispatch("setData", {
      type: "applications", 
      data: updateClone
    })
    await insertApplication(newApp);
    setFields({...initFieldsState});
    Alert.alert("Success", "Application Succesfully Added!")
  }

  const showApplicationsHandler = async () => props.onModalChange(true)
  const newApplicationHandler = async () => props.onNewApplication(true)
  const showForms = async () => props.onNewForms(true)
  const exportDataHandler = async () => {
    try {
      setIsLoading(true)
      await exportData(applications)
    } catch (error) {
      alert(error.message)      
    }
    setIsLoading(false)

  }
  const importDataHandler = async () => {
    setIsLoading(true);
    let data = await importData();
    if(data)
    {
      let result = await insertManyApplications(data);
      if(result)
      {
        let apps = await getApplications();
          if(apps)
            dispatch("setData", {type: "applications", data: apps})
        Alert.alert("Success", "Data Successfuly Imported");

      }
    }
    setIsLoading(false);
  }

  const fetchProvince = async () => {
    try {
      setIsLoading(true);
      let response = await fetch(serverPath("/easyform/provinces"), {
        method: "POST",
        headers: {
          "Authorization": `bearer ${token}`
        },
      });
      const objData = await response.json();
      if(objData.status === 'success')
      {
        await setProvince(objData.data)
        dispatch("setData", {type: "provinces", data: objData.data})
        Alert.alert("Success", "Update Provinces Successfully Loaded!")
      }
      if(objData.status === 'failure')
        Alert.alert("Info", objData.message)
        setIsLoading(false)
    } catch (error) {
        console.log(error)
        Alert.alert("Info", "Please try again!")
        setIsLoading(false)
    }
  }



  const showProvinces = async () => {
    Alert.alert("Active Provinces", (provinces.map(per => (per.name)).join("\n")))
  }

  return (
    <ScrollView>
      <Button 
        label={"Validate Form"}
        onPress={loadKeyhandler}
        style={{...styles.btns,...styles.validateBTN}}
        textStyle={{
          color: "rgba(0, 0, 0, 0.5)", 
        }}
        loading={isLoading}
      />
      <View style={{          
        borderTopColor: "rgba(0, 0, 0, 0.2)", 
        borderTopWidth: 1,
        width: "90%",
        alignSelf: "center",
        marginTop: 10,
        marginBottom: 5,
        }}></View>
      <Button 
        label={"New Application"}
        onPress={newApplicationHandler}
        style={{
          ...styles.btns, 
          ...styles.validateBTN, 
          backgroundColor: Constant.inputSecondary, 
        }}
        textStyle={{
          color: "rgba(0, 0, 0, 0.5)", 
        }}
        loading={isLoading}
      />
      <View style={styles.form}>
        <Text style={styles.header}>
          Barcode Form
        </Text>
        <Input 
          label={'Name'}
          style={{...styles.input, ...styles.barCode}}
          onChange={(value) => setFieldHandler(value, "name")}
          value={fields.name}
          />
        <Input 
          label={'Barcode'}
          style={{...styles.input, ...styles.barCode}}
          onChange={(value) => setFieldHandler(value?.trim(), "barCode")}
          value={fields.barCode}
          />
        <Input
          label={'Birth Date'}
          style={{...styles.input, ...styles.date}}
          onChange={(value) => setFieldHandler(value?.trim(), "date")}
          value={fields.date}
        />
        <Button 
          label={"Save Barcode"}
          onPress={saveFormHandler}
          style={{...styles.btns,...styles.saveBTN}}
          textStyle={{
            color: "rgba(0, 0, 0, 0.5)", 
          }}
          loading={isLoading}
        />
      </View>

      <View style={styles.form}>
        <Text style={styles.header}>
          Database
        </Text>
        <Button
            label={"Show New Applications"}
            onPress={showForms}
            style={{...styles.btns, marginBottom: 10, backgroundColor: "#F2C18D"}}
            textStyle={{
              color: "rgba(0, 0, 0, 0.5)", 
            }}
            loading={isLoading}
          />
        <Button
            label={"Show Barcodes"}
            onPress={showApplicationsHandler}
            style={{...styles.btns}}
            textStyle={{
              color: "rgba(0, 0, 0, 0.5)", 
            }}
            loading={isLoading}
          />
        <View style={styles.row}>
          <Button
            label={"Import Data"}
            onPress={importDataHandler}
            style={{...styles.btns,...styles.importBTN}}
            textStyle={{
              color: "rgba(0, 0, 0, 0.5)", 
            }}
            loading={isLoading}
          />
          <Button
            label={"Export Data"}
            onPress={exportDataHandler}
            style={{...styles.btns,...styles.exportBTN}}
            textStyle={{
              color: "rgba(0, 0, 0, 0.5)", 
            }}
            loading={isLoading}
          />
        </View>

      </View>
      <View style={styles.form}>
        <Text style={styles.header}>
          Provinces
        </Text>
        <View style={styles.row}>
          <Button
            label={"Fetch Provinces"}
            onPress={fetchProvince}
            style={{...styles.btns,...styles.importBTN, backgroundColor: Constant.simpleGreen}}
            textStyle={{
              color: "rgba(0, 0, 0, 0.5)", 
            }}
            loading={isLoading}
          />
          <Button
            label={"Show Provinces"}
            onPress={showProvinces}
            style={{...styles.btns,...styles.exportBTN, backgroundColor: Constant.simpleWhiteGreen}}
            textStyle={{
              color: "rgba(0, 0, 0, 0.5)", 
            }}
            loading={isLoading}
          />
        </View>

      </View>
      <View style={{maxWidth: "80%", alignSelf: "center"}}>
        <TouchableOpacity style={{...styles.contactButton, marginTop: 20}} 
          activeOpacity={0.6}
          onPress={() => {Linking.openURL("mailto:iamceayber@gmail.com")}}
          >
          <Text style={{textAlign: "center", color: Constant.inputPrimary, fontWeight: "bold", fontSize: 16}}>
            Contact Email: 
          </Text>
          <Text style={{textAlign: "center", color: Constant.inputPrimary, fontWeight: "bold", marginLeft: 5, fontSize: 15}}>
            iamceayber@gmail.com
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{...styles.contactButton, marginBottom: 40, marginTop:10}}
          activeOpacity={0.6}
          onPress={() => {Linking.openURL('whatsapp://send?text=About Easy Form&phone=+93744488816')}}
          >
          <Text style={{textAlign: "center", color: Constant.inputPrimary, fontWeight: "bold", fontSize: 16}}>
            WhatsApp: 
          </Text>
          <Text style={{textAlign: "center", color: Constant.inputPrimary, fontWeight: "bold", marginLeft: 5, fontSize: 15}}>
            +93744488816
          </Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  )
};


const styles = StyleSheet.create({
  btns: {
    borderRadius: 5,
    alignSelf: "center",
    elevation: 3,
  },
  validateBTN: {    
    width: "90%",
    marginTop: 5,
    backgroundColor: Constant.simpleGreen,
  },
  form: {
    width: "90%",
    alignSelf: "center",
    borderTopColor: "rgba(0, 0, 0, 0.2)",
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  header: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    color: Constant.primary,
    marginBottom: 10
  },
  input: {

  },
  barCode: {
    marginBottom: 20
  },
  date: {
    marginBottom: 20
  },
  submitBTN: {
    backgroundColor: Constant.secondary,
  },
  saveBTN: {
    backgroundColor: Constant.inputSecondary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  },
  importBTN:
  {
    width: "48%",
    backgroundColor: Constant.inputPrimary
  },
  exportBTN:
  {
    width: "48%",
    backgroundColor: Constant.inputSecondary
  },
  contactButton:
  {
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    opacity: 0.8,
    width: "100%"
  }
})


export default Forms;