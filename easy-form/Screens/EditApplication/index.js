import React, { useContext, useEffect, useState } from 'react';
import {View, Text, StyleSheet, Alert, TouchableOpacity, BackHandler, Switch, ScrollView} from 'react-native';
import {Picker} from '@react-native-picker/picker'
import Constant, { afghanistanProvinces, applicantAge, headHeight, passportDuration } from '../../Constant';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import { insertApplication, updateApplication } from '../../DB';
import useStore from '../../store/store';
import {findOne, updateOne} from '../../utils/lightCrud';
import { AuthContext } from '../../authContext';
const EditApplication = (props) =>
{

  const {tokenInfo} = useContext(AuthContext);
  const [globalState, dispatch] = useStore();
  const {applications} = globalState;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      props.onSetEditApplication({show: false, data: {}});
      return true;
    });
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", subscription)
  }, []);

  const initFieldsState = {
    barCode: props.barCode,
    date: props.date,
    name: props.name,
    province: props.province,
    checked: props.checked,
  };

  const initAppFieldsState = {
    axFullAddress: props.province,
    axPrimaryMobile: tokenInfo.phone,
    ucaDurationTypeID: "1",
    ucaPaymentTypeID: "1",
  };
  const [fields, setFields] = useState({...initFieldsState})
  const [appFields, setAppFields] = useState({...initAppFieldsState})
  const setFieldHandler = (value, type) => (isLoading || setFields(prev => ({...prev, [type] : value})))
  const setAppFieldHandler = (value, type) => (isLoading || setAppFields(prev => ({...prev, [type] : value})))

  const saveFormHandler = async () => 
  {
    for (const key in fields)
      if (Object.hasOwnProperty.call(fields, key)) {
        const value = fields[key];
        if(value.length <= 0)
          return Alert.alert("Info!", key.toUpperCase()+" Input Is Required!");
      }

    try {
      await updateApplication(fields);
      dispatch('setData', {type: "applications", data: [...updateOne(applications, props.barCode, fields)]});
      Alert.alert("Success", "Application Succesfully Updated!");
      props.onSetEditApplication({show: false, data: {}})
    } catch (error) {
      console.log(error)
      Alert.alert("Info!", error.message)
    }
  }

  const sendFormHandler = async () => 
  {
    for (const key in appFields)
      if (Object.hasOwnProperty.call(appFields, key)) {
        const value = appFields[key];
        if(value.length <= 0)
          return Alert.alert("Info!", key.toUpperCase()+" Input Is Required!");
      }

    try {
      await props.onSend({...fields, ...appFields, axFullAddress: fields.province})
    } catch (error) {
      console.log(error)
      Alert.alert("Info!", error.message)
    }
  }

  return (
      <View style={styles.container}>
        <View style={{...styles.row, ...styles.head, marginTop: 0}}>
          <Text style={{fontWeight: "bold", color: Constant.white, fontSize: 17}}>
            Edit Application
          </Text>
          <TouchableOpacity style={styles.closeBTN} activeOpacity={0.8} onPress={()=>props.onSetEditApplication({show: false, data: {}})}>
            <Text style={styles.closeText}>Back</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
        <View style={styles.form}>
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
          <View>
            <Text style={{
              color: Constant.secondary,
              fontWeight: "600",
              marginBottom: 2,
            }}>Select Province</Text>
            <View style={{
                  borderWidth: 2,
                  borderColor: Constant.secondary,
                  backgroundColor: Constant.whiteGreen,
                  borderRadius: 5,
                  overflow: "hidden",
                  marginBottom: 10,
                  elevation: 2,
            }}>
            <Picker
              style={{
                  width: "100%",
                  alignSelf:"center",
                  fontSize: 16,
                  backgroundColor: Constant.whiteGreen,
                  color: Constant.secondary,
              }}
              selectedValue={fields.province}
              onValueChange={(itemValue, itemIndex) =>
                setFieldHandler(itemValue, 'province')
              }
            >
              <Picker.Item label="Select Province" value={null} />
              {afghanistanProvinces.map((province) => (
                <Picker.Item key={province.province} label={province.province} value={province.province} />
              ))}
            </Picker>
            </View>
          </View>
          <View style={{alignItems: "flex-start", marginBottom: 10}}>
            <Text style={{
              color: Constant.secondary,
              fontWeight: "600",
              marginBottom: 5,
            }}>
              Is Application Changed to its province
            </Text>
            <Switch
              trackColor={{ false: "#767577", true: Constant.secondary }}
              thumbColor={fields.checked ? Constant.inputSecondary : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => setFields(prev => ({...prev, checked: (!prev.checked)}))}
              value={fields.checked ? true : false}
              style={{marginLeft: 5}}
            />
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
          <View style={{marginTop: 15}}>
            <View>
              <Text style={{
                color: Constant.secondary,
                fontWeight: "600",
                marginBottom: 2,
              }}>Passport Duration</Text>
              <View style={{
                    borderWidth: 2,
                    borderColor: Constant.secondary,
                    backgroundColor: Constant.whiteGreen,
                    borderRadius: 5,
                    overflow: "hidden",
                    marginBottom: 10,
                    elevation: 2,
              }}>
              <Picker
                style={{
                    width: "100%",
                    alignSelf:"center",
                    fontSize: 16,
                    backgroundColor: Constant.whiteGreen,
                    color: Constant.secondary,
                }}
                selectedValue={appFields.ucaDurationTypeID}
                onValueChange={(itemValue, itemIndex) =>
                  setAppFieldHandler(itemValue, 'ucaDurationTypeID')
                }
              >
                {passportDuration.map((per) => (
                  <Picker.Item key={per.value} label={per.type} value={per.value} />
                ))}
              </Picker>
              </View>
            </View>
            <View>
              <Text style={{
                color: Constant.secondary,
                fontWeight: "600",
                marginBottom: 2,
              }}>Applicant Age</Text>
              <View style={{
                    borderWidth: 2,
                    borderColor: Constant.secondary,
                    backgroundColor: Constant.whiteGreen,
                    borderRadius: 5,
                    overflow: "hidden",
                    marginBottom: 10,
                    elevation: 2,
              }}>
              <Picker
                style={{
                    width: "100%",
                    alignSelf:"center",
                    fontSize: 16,
                    backgroundColor: Constant.whiteGreen,
                    color: Constant.secondary,
                }}
                selectedValue={appFields.ucaPaymentTypeID}
                onValueChange={(itemValue, itemIndex) =>
                  setAppFieldHandler(itemValue, 'ucaPaymentTypeID')
                }
              >
                {applicantAge.map((per) => (
                  <Picker.Item key={per.value} label={per.type} value={per.value} />
                ))}
              </Picker>
              </View>
            </View>
            <Button 
              label={"Send Form"}
              onPress={sendFormHandler}
              style={{...styles.btns,...styles.sendBTN}}
              textStyle={{
                color: "rgba(0, 0, 0, 0.5)", 
              }}
              loading={isLoading}
            />
          </View>
        </View>
        </ScrollView>
      </View>
  )
};


const styles = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: Constant.whiteGreen,
    flex: 1,
    width: "100%",
    height: "100%",
    zIndex: 9999,
    paddingBottom: headHeight
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
})


export default EditApplication;