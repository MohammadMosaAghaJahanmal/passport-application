import React, { useContext, useEffect, useState } from 'react';
import {View, Text, StyleSheet, Alert, TouchableOpacity, BackHandler, Switch, ScrollView, StatusBar} from 'react-native';
import {Picker} from '@react-native-picker/picker'
import Constant, { 
  afghanistanProvinces, 
  applicantAge, 
  passportDuration,
  passportTitle,
  passportType,
  typeOfIdentity,
  passportColors,
  maritalStatus,
  gender
} from '../../Constant';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import { insertForm } from '../../DB';
import useStore from '../../store/store';
import {findOne, updateOne} from '../../utils/lightCrud';
import { AuthContext } from '../../authContext';
import validator from '../../validators/application'
import generateRandomString from '../../utils/generateRandomString';


const NewApplication = (props) =>
{

  const {tokenInfo, token} = useContext(AuthContext);
  const [globalState, dispatch] = useStore();
  const {newforms} = globalState;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    StatusBar.setBackgroundColor(Constant.secondary, false);
    let subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      props.onNewApplication(false);
      return true;
    });
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", subscription)
  }, []);

  const initFieldsState = {
    uxTitleID:"1",
    uxCriminalRecord:"2",
    uxFamilyNameLocal:generateRandomString(8, "ps"),
    uxFamilyName:generateRandomString(8, "en"),
    uxGivenNamesLocal:generateRandomString(8, "ps"),
    uxGivenNames:generateRandomString(8, "en"),
    uxFatherNameLocal:generateRandomString(8, "ps"),
    uxFatherName:generateRandomString(8, "en"),
    uxGrandFatherNameLocal:generateRandomString(8, "ps"),
    uxGrandFatherName:generateRandomString(8, "en"),
    uxBirthDate_Shamsi:"1380/01/01",
    uxBirthDate:"2001-03-21",
    uxProfessionID:"22",
    _Profession:"22",
    uxBirthLocationID:"31",
    uxResidenceCountryID:"31",
    uxMaritalStatusID:"1",
    uxNIDTypeID:"11",
    uxSerial:generateRandomString(10, "num"),
    uxJuld:"",
    uxPage:"",
    uxNo:"",
    uxNID:generateRandomString(10, "num"),
    uxGenderID:"1",
    uxHairColorID:"1",
    uxEyeColorID:"1",
    uxBodyHeightCM:"170",
    uxCode:"",
    axFullAddress: generateRandomString(10, "ps"),
    axPrimaryMobile: tokenInfo.phone,
    axLocationID: "31",
    ucaDurationTypeID: "1",
    ucaPaymentTypeID: "1",
  };

  const [fields, setFields] = useState({...initFieldsState})
  const setFieldHandler = (value, type) => (isLoading || setFields(prev => ({...prev, [type] : value})))

  const saveFormHandler = async () => 
  {
    
    const {data, message} = validator(fields)
    if(message)
      return Alert.alert("Failure", message);
    if(fields.uxNIDTypeID == "8" && (fields.uxJuld.trim().length <= 0 || fields.uxPage.trim().length <= 0 || fields.uxNo.trim().length <= 0))
      return Alert.alert("Failure", "Juld, Page And Reg Number fields are Required!");
      data.uxNID = JSON.stringify({S: data.uxSerial, J: data.uxJuld, P: data.uxPage, N:data.uxNo})

    try {

      const exist = findOne(newforms, data.uxSerial, "uxSerial")
      if(exist)
        return Alert.alert("Info !", "This Tazkira Id Is Already Exist!");
      
      await insertForm(data);
      dispatch('setData', {type: "newforms", data: [...newforms, data]});
      Alert.alert("Success", "Application Succesfully Updated!");
      props.onNewApplication(false);

    } catch (error) {
      console.log(error)
      Alert.alert("Info!", error.message)
    }
  }
  return (
      <View style={styles.container}>
        <View style={{...styles.row, ...styles.head, marginTop: 0}}>
          <Text style={{fontWeight: "bold", color: Constant.white, fontSize: 17}}>
            New Application
          </Text>
          <TouchableOpacity style={styles.closeBTN} activeOpacity={0.8} onPress={()=>props.onNewApplication(false)}>
            <Text style={styles.closeText}>Back</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
        <View style={styles.form}>
          <View style={styles.row}>
            <View style={{width: "49%"}}>
              <Text style={styles.pickerLabel}>Title</Text>
              <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={(fields.uxTitleID + "")}
                onValueChange={(itemValue, itemIndex) =>
                  setFieldHandler(itemValue, 'uxTitleID')
                }>
                {passportTitle.map((per) => (
                  <Picker.Item key={per.value} label={per.type} value={(per.value + "")} />
                ))}
              </Picker>
              </View>
            </View>
            <View style={{width: "49%"}}>
              <Text style={styles.pickerLabel}>Type Of Application</Text>
              <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={(fields.uxCriminalRecord + "")}
                onValueChange={(itemValue, itemIndex) =>
                  setFieldHandler(itemValue, 'uxCriminalRecord')
                }>
                {passportType.map((per) => (
                  <Picker.Item key={per.value} label={per.type} value={(per.value + "")} />
                ))}
              </Picker>
              </View>
            </View>
          </View>
          <View style={styles.row}>
            <Input 
              label={'Pashto Family Name'}
              placeholder={"Family name"}
              style={{...styles.input, ...styles.barCode, ...styles.devide}}
              onChange={(value) => setFieldHandler(value, "uxFamilyNameLocal")}
              value={fields.uxFamilyNameLocal}
              />
            <Input 
              label={'English Family Name'}
              placeholder={"Family name"}
              style={{...styles.input, ...styles.barCode, ...styles.devide}}
              onChange={(value) => setFieldHandler(value, "uxFamilyName")}
              value={fields.uxFamilyName}
              />
          </View>
          <View style={styles.row}>
            <Input 
              label={'Pashto Name'}
              placeholder={"Name"}
              style={{...styles.input, ...styles.barCode, ...styles.devide}}
              onChange={(value) => setFieldHandler(value, "uxGivenNamesLocal")}
              value={fields.uxGivenNamesLocal}
              />
            <Input 
              label={'English Name'}
              placeholder={"Name"}
              style={{...styles.input, ...styles.barCode, ...styles.devide}}
              onChange={(value) => setFieldHandler(value, "uxGivenNames")}
              value={fields.uxGivenNames}
              />
          </View>
          <View style={styles.row}>
            <Input 
              label={'PS Father Name'}
              placeholder={"Father Name"}
              style={{...styles.input, ...styles.barCode, ...styles.devide}}
              onChange={(value) => setFieldHandler(value, "uxFatherNameLocal")}
              value={fields.uxFatherNameLocal}
              />
            <Input 
              label={'EN Father Name'}
              placeholder={"Father Name"}
              style={{...styles.input, ...styles.barCode, ...styles.devide}}
              onChange={(value) => setFieldHandler(value, "uxFatherName")}
              value={fields.uxFatherName}
              />
          </View>
          <View style={styles.row}>
            <Input 
              label={'PS Grandfather Name'}
              placeholder={"Grandfather Name"}
              style={{...styles.input, ...styles.barCode, ...styles.devide}}
              onChange={(value) => setFieldHandler(value, "uxGrandFatherNameLocal")}
              value={fields.uxGrandFatherNameLocal}
              />
            <Input 
              label={'EN Grandfather Name'}
              placeholder={"Grandfather Name"}
              style={{...styles.input, ...styles.barCode, ...styles.devide}}
              onChange={(value) => setFieldHandler(value, "uxGrandFatherName")}
              value={fields.uxGrandFatherName}
              />
          </View>
          <View style={styles.row}>
            <Input 
              label={'Shamsi DOB'}
              placeholder={"1400/12/29"}
              style={{...styles.input, ...styles.barCode, ...styles.devide}}
              onChange={(value) => setFieldHandler(value, "uxBirthDate_Shamsi")}
              value={fields.uxBirthDate_Shamsi}
              />
            <Input 
              label={'Miladi DOB'}
              placeholder={"2024-12-30"}
              style={{...styles.input, ...styles.barCode, ...styles.devide}}
              onChange={(value) => setFieldHandler(value, "uxBirthDate")}
              value={fields.uxBirthDate}
              />
          </View>
          <View style={styles.row}>
            <View style={{width: "49%"}}>
              <Text style={styles.pickerLabel}>Place Of Birth</Text>
              <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={(fields.uxBirthLocationID + "")}
                onValueChange={(itemValue, itemIndex) =>
                  setFieldHandler(itemValue, 'uxBirthLocationID')
                }>
                {afghanistanProvinces.map((per) => (
                  <Picker.Item key={per.id} label={per.province} value={(per.id + "")} />
                ))}
              </Picker>
              </View>
            </View>
            <View style={{width: "49%"}}>
              <Text style={styles.pickerLabel}>Current Location</Text>
              <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={(fields.uxResidenceCountryID + "")}
                onValueChange={(itemValue, itemIndex) =>
                  setFieldHandler(itemValue, 'uxResidenceCountryID')
                }>
                {afghanistanProvinces.map((per) => (
                  <Picker.Item key={per.id} label={per.province} value={(per.id + "")} />
                ))}
              </Picker>
              </View>
            </View>
          </View>
          <View>
            <Text style={styles.pickerLabel}>National ID Type</Text>
            <View style={styles.pickerView}>
            <Picker
              style={styles.picker}
              selectedValue={(fields.uxNIDTypeID + "")}
              onValueChange={(itemValue, itemIndex) =>
                setFieldHandler(itemValue, 'uxNIDTypeID')
              }>
              {typeOfIdentity.map((per) => (
                <Picker.Item key={per.value} label={per.type} value={(per.value + "")} />
              ))}
            </Picker>
            </View>
          </View>
          <View style={styles.row}>
            <Input 
              inputStyle={{paddingVertical: 13}}
              label={fields.uxNIDTypeID != "9" ? 'Tazkira ID' : 'Card Number'}
              style={{...styles.input, ...styles.barCode, ...styles.devide}}
              onChange={(value) => setFieldHandler(value, "uxSerial")}
              value={fields.uxSerial}
              />
            <View style={{width: "49%"}}>
              <Text style={styles.pickerLabel}>Marital Status</Text>
              <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={(fields.uxMaritalStatusID + "")}
                onValueChange={(itemValue, itemIndex) =>
                  setFieldHandler(itemValue, 'uxMaritalStatusID')
                }>
                {maritalStatus.map((per) => (
                  <Picker.Item key={per.value} label={per.type} value={(per.value + "")} />
                ))}
              </Picker>
              </View>
            </View>
          </View>
          {fields.uxNIDTypeID == "8" &&
          <View style={styles.row}>
            <Input 
              label={"Juld"}
              style={{...styles.input, ...styles.barCode, ...styles.devide3}}
              onChange={(value) => setFieldHandler(value, "uxJuld")}
              value={fields.uxJuld}
              />
            <Input 
              label={"Page"}
              style={{...styles.input, ...styles.barCode, ...styles.devide3}}
              onChange={(value) => setFieldHandler(value, "uxPage")}
              value={fields.uxPage}
              />
            <Input 
              label={"Reg Number"}
              style={{...styles.input, ...styles.barCode, ...styles.devide3}}
              onChange={(value) => setFieldHandler(value, "uxNo")}
              value={fields.uxNo}
              />
          </View>
          }
          <View style={styles.row}>
            <View style={styles.devide}>
              <Text style={styles.pickerLabel}>Hair Color</Text>
              <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={(fields.uxHairColorID + "")}
                onValueChange={(itemValue, itemIndex) =>
                  setFieldHandler(itemValue, 'uxHairColorID')
                }>
                {passportColors.map((per) => (
                  <Picker.Item key={per.value} label={per.type} value={(per.value + "")} />
                ))}
              </Picker>
              </View>
            </View>
            <View style={styles.devide}>
              <Text style={styles.pickerLabel}>Eyes Color</Text>
              <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={(fields.uxEyeColorID + "")}
                onValueChange={(itemValue, itemIndex) =>
                  setFieldHandler(itemValue, '.uxEyeColorID')
                }>
                {passportColors.map((per) => (
                  <Picker.Item key={per.value} label={per.type} value={(per.value + "")} />
                ))}
              </Picker>
              </View>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.devide}>
              <Text style={styles.pickerLabel}>Gender</Text>
              <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={(fields.uxGenderID + "")}
                onValueChange={(itemValue, itemIndex) =>
                  setFieldHandler(itemValue, 'uxGenderID')
                }>
                {gender.map((per) => (
                  <Picker.Item key={per.value} label={per.type} value={(per.value + "")} />
                ))}
              </Picker>
              </View>
            </View>
            <Input 
              inputStyle={{paddingVertical: 13}}
              label={"Height by CM"}
              style={{...styles.input, ...styles.barCode, ...styles.devide}}
              onChange={(value) => setFieldHandler(value, "uxBodyHeightCM")}
              value={fields.uxBodyHeightCM}
              keyboardType={'phone-pad'}
              />
          </View>
          <Input 
            label={"Address"}
            style={{...styles.input, ...styles.barCode}}
            onChange={(value) => setFieldHandler(value, "axFullAddress")}
            value={fields.axFullAddress}
            />
          <Input 
            label={"Phone Number"}
            style={{...styles.input, ...styles.barCode}}
            onChange={(value) => setFieldHandler(value, "axPrimaryMobile")}
            value={fields.axPrimaryMobile}
            />
          <View>
            <Text style={styles.pickerLabel}>Select Province</Text>
            <View style={styles.pickerView}>
            <Picker
              style={styles.picker}
              selectedValue={(fields.axLocationID + "")}
              onValueChange={(itemValue, itemIndex) =>
                {
                  let getProvinceName = afghanistanProvinces[itemIndex].province;
                  setFieldHandler(itemValue, 'axLocationID')
                  setFieldHandler(getProvinceName, 'axFullAddress')
                }
              }
            >
              {afghanistanProvinces.map((province) => (
                <Picker.Item key={province.id} label={province.province} value={(province.id + "")} />
              ))}
            </Picker>
            </View>
          </View>
          <View>
            <View>
              <Text style={styles.pickerLabel}>Passport Duration</Text>
              <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={(fields.ucaDurationTypeID + "")}
                onValueChange={(itemValue, itemIndex) =>
                  setFieldHandler(itemValue, 'ucaDurationTypeID')
                }
              >
                {passportDuration.map((per) => (
                  <Picker.Item key={per.value} label={per.type} value={(per.value + "")} />
                ))}
              </Picker>
              </View>
            </View>
            <View>
              <Text style={styles.pickerLabel}>Applicant Age</Text>
              <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={(fields.ucaPaymentTypeID + "")}
                onValueChange={(itemValue, itemIndex) =>
                  setFieldHandler(itemValue, 'ucaPaymentTypeID')
                }
              >
                {applicantAge.map((per) => (
                  <Picker.Item key={per.value} label={per.type} value={(per.value + "")} />
                ))}
              </Picker>
              </View>
            </View>
          </View>
          <Button 
            label={"Save Form"}
            onPress={saveFormHandler}
            style={{...styles.btns,...styles.submitBTN}}
            textStyle={{
              color: "rgba(0, 0, 0, 0.5)", 
            }}
            loading={isLoading}
          />
        </View>
        </ScrollView>
      </View>
  )
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: Constant.whiteGreen,
    flex: 1,
    // paddingBottom: headHeight
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
  btns: {
    borderRadius: 5,
    alignSelf: "center",
    elevation: 3,
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
  barCode: {
    marginBottom: 20
  },
  date: {
    marginBottom: 20
  },
  submitBTN: {
    backgroundColor: Constant.inputSecondary,
  },
  sendBTN: {
    backgroundColor: Constant.secondary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
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
  pickerView: {
    borderWidth: 2,
    borderColor: Constant.secondary,
    backgroundColor: Constant.whiteGreen,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 10,
    elevation: 2,
  },
  pickerLabel:{
    color: Constant.secondary,
    fontWeight: "600",
    marginBottom: 2,
  },
  picker: {
    width: "100%",
    alignSelf:"center",
    backgroundColor: Constant.whiteGreen,
    color: Constant.secondary,
  },
  devide: {
    width: "49%"
  },
  devide3: {
    width: "32%"
  }
})


export default NewApplication;