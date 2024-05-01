import React, { useContext, useEffect, useState } from 'react';
import {View, Text, StyleSheet, KeyboardAvoidingView, Alert, StatusBar} from 'react-native';
import SimpleCard from '../../Components/SimpleCard'
import Button from '../../Components/Button';
import Colors from '../../Constant';
import Input from '../../Components/Input';
import Shape from '../../Components/Shape';
import {getToken, setToken as storeToken} from '../../LocalStorage'
import { AuthContext } from '../../authContext';
import serverPath from '../../utils/serverPath';
// import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = (props) =>
{

  const {setAuth, deviceInfo, } = useContext(AuthContext)
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  // const [path, setPath] = useState("http://192.168.43:8080");
  const [isLoading, setisLoading] = useState(false);
  const submitHandler = async () =>
  {

    if(token.length <= 0 || phone.length <= 0)
      return Alert.alert("Info!", "Please fill out all the inputs!");

    if(phone.search(/^07\d{8}$/ig) < 0)
      return Alert.alert("Info!", "Invalid Phone Number Entered!");

    if(token.length <= 30)
      return Alert.alert("Info!", "Invalid Token Entered!");

      

      try {
      setisLoading(true);
      const loginPath = await serverPath('/auth/easyform/login')
      // let authResp = await fetch(`${path}/v1/auth/easyform/login`,{
      let authResp = await fetch(loginPath,{
        method: "POST", 
        headers: {"Content-Type": "Application/JSON"}, 
        body: JSON.stringify({deviceInfo, phone, token})
      })
      if(authResp.status == 429)
      {
        Alert.alert("Warning", "Too Many Tries. Please Try Again After A While!")
        setisLoading(false);
        return
      }
      const objData = await authResp.json();
      if(objData.status === 'failure')
      {
        Alert.alert("Info!", objData.message)
      }
      if(objData.status === 'success')
      {
        // await AsyncStorage.setItem("SERVER_PATH", path)
        console.log(objData.token.token)
        await storeToken(objData.token.token)
        setAuth((prev) => ({...prev, loading: false, login: true, token: objData.token.token, tokenInfo: objData.token}));
      }
    } catch (error) {
      console.log(error)
      Alert.alert("Info!", error.message)
    }
    setisLoading(false);

  }

  useEffect(() => 
  {
    (async() =>
    {
      StatusBar.setBackgroundColor(Colors.primary, true)
      let GET_TOKEN = await getToken()
      if(GET_TOKEN)
        setToken(GET_TOKEN)
    })()
    
  }, [])


  return (
    <View style={styles.container}>
      <Shape style={{top: -100, right: -100, backgroundColor: Colors.primary}} />
      <Shape style={{top: -100, left: -100, backgroundColor: Colors.primary}} />
      <Shape style={{bottom: -100, right: -100, backgroundColor: Colors.primary}} />
      <Shape style={{bottom: -100, left: -100, backgroundColor: Colors.primary}} />

      <KeyboardAvoidingView 
        behavior='position' 
        contentContainerStyle={styles.container} 
        style={{width: "100%", height: 300}}
      >
      <Text style={styles.header}>
        Welcome To Easy Form App
      </Text>
      <SimpleCard style={styles.card}>
        {/* <Input 
            label="Server PATH" 
            style={{marginBottom: 20}}
            placeholder="URL"
            value={path}
            onChange={setPath}
          /> */}
        <Input 
          label="Phone" 
          style={{marginBottom: 20}}
          placeholder="0712345678"
          value={phone}
          onChange={setPhone}
          keyboardType={'phone-pad'}
          maxLength={10} 
        />
        <Input 
          label="Token" 
          style={{marginBottom: 20}}
          placeholder="Enter Your Token"
          value={token}
          onChange={setToken}
        />
        <Button 
          label={"Login"} 
          style={{backgroundColor: Colors.simpleWhiteGreen, elevation: 2}} 
          loading={isLoading} 
          textStyle={{
            color: "rgba(0, 0, 0, 0.5)", 
          }}
          onPress={submitHandler}
        />
      </SimpleCard>
      </KeyboardAvoidingView>

    </View>
  )
};


const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: Colors.whiteGreen
  },
  card: 
  {
    width: "90%",
    alignItems: "center",
    backgroundColor: Colors.whiteGreen,
    elevation: 3
  },
  header:
  {
    color: Colors.secondary,
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 35,
    textShadowColor: "rgba(50, 50, 50, .2)",
    textShadowOffset: {height: 2, width: 2},
    textShadowRadius: 5
  }
})


export default Login;