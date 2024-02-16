import React, { memo, useEffect, useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, BackHandler, ScrollView} from 'react-native';
import {Picker} from '@react-native-picker/picker'
import Constant from '../../Constant';
import Input from '../../Components/Input';
import useStore from '../../store/store';
import ListItem from '../../Components/ListItem';
const SearchApplication = (props) =>
{

  const [globalState] = useStore();
  const {applications} = globalState;

  useEffect(() => {
    let subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      props.setIsSearching(false);
      return true;
    });
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", subscription)
  }, []);

  const initFieldsState = {
    search: "",
    foundedApplications: [],
    type: "barCode"
  };
  let TYPES = [
    {
      type: "barCode",
      label: "BarCode",
    },
    {
      type: "name",
      label: "Name",
    },
    {
      type: "date",
      label: "Date",
    },
    {
      type: "province",
      label: "Province",
    },
]
  const [fields, setFields] = useState({...initFieldsState})
  const setFieldHandler = (value, type) => (setFields(prev => ({...prev, [type] : value})))


  useEffect(() =>
  {

    let TIME_OUT;
    if(fields.search.length >= 3 && fields.type.length >= 3)
    {
      TIME_OUT = setTimeout(() => {
        let findApps = applications.filter(perApp => ((perApp[fields.type]).search(new RegExp(fields.search, "gi")) >= 0));
        if(findApps.length <= 0 && fields.foundedApplications.length <= 0)
          return
          setFieldHandler(findApps.slice(0, 3), "foundedApplications")
      }, 300);

    }

    return () => clearTimeout(TIME_OUT)


  }, [fields.search, fields.type])


  

  return (
      <View style={styles.container}>
        <View style={{...styles.row, ...styles.head}}>
          <Text style={{fontWeight: "bold", color: Constant.white, fontSize: 17}}>
            Search Application
          </Text>
          <TouchableOpacity style={styles.closeBTN} activeOpacity={0.8} onPress={()=>props.setIsSearching(false)}>
            <Text style={styles.closeText}>Back</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          <View style={styles.form}>
          <View>
              <Text style={{
                color: Constant.secondary,
                fontWeight: "600",
                marginBottom: 2,
              }}>Search By</Text>
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
                selectedValue={fields.type}
                onValueChange={(itemValue, itemIndex) =>
                    setFieldHandler(itemValue, 'type')
                }
              >
                {TYPES.map((type) => (
                  <Picker.Item key={type.label} label={type.label} value={type.type} />
                ))}
              </Picker>
              </View>

            </View>
            <Input 
              label={'Search'}
              style={{...styles.input, ...styles.barCode}}
              onChange={(value) => setFieldHandler(value, "search")}
              value={fields.search}
              />
            <View>
              { fields.foundedApplications.length > 0 &&
                fields.foundedApplications.map(app => (
                  <ListItem 
                    key={app.barCode}
                    onDelete={async (data) => {
                      await props.onDelete(data)
                      setFields({...initFieldsState})
                    }}
                    onEdit={async (data) => {
                      props.setIsSearching(false)
                      props.onEdit(data)
                    }}
                    onSubmit={async (data) => {
                      props.setIsSearching(false)
                      await props.onSubmit(data)
                    }}
                    onOpen={async (data) => {
                      props.setIsSearching(false)
                      await props.onOpen(data)
                    }}
                    {...app}
                    />
                ))
              }
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
    zIndex: 9999
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


export default memo(SearchApplication);