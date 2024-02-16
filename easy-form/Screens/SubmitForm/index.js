import React, { useContext, useEffect, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';
import {WebView}  from 'react-native-webview';
import { AuthContext } from '../../authContext';
import { form, submitFormByBrowser } from '../../Constant';
import Button from '../../Components/Button';
import extractKeysFromHTML from '../../utils/extractKeysFromHTML';
const SubmitForm = ({ barCode, date, onSubmitForm }) => {

  const {secrets} = useContext(AuthContext);
  const {__EVENTVALIDATION, __VIEWSTATE} = secrets;

  const [htmlText, setHtmlText] = useState('');


  useEffect(() => {
    (async() => {
      // setHtmlText();
      let reasult = form({ __EVENTVALIDATION, __VIEWSTATE, barCode, date });
      // let reasult = await submitFormByBrowser({ __EVENTVALIDATION, __VIEWSTATE, barCode, date })
      // extractKeysFromHTML(reasult);
      setHtmlText(reasult);
    })()
  }, [barCode, date, __EVENTVALIDATION, __VIEWSTATE]);



  const handleMessage = event => {
    const data = JSON.parse(event.nativeEvent.data);
    console.log(data, "_____DATA");
  };
  const webViewRef = useRef(null);
  

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      onSubmitForm(prev => ({ ...prev, show: false }));
      return true;
    });
    return () => BackHandler.removeEventListener("hardwareBackPress", subscription);
  }, []);






  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ html: htmlText}}
        // source={{ uri: "http://passport.moi.gov.af/BarcodeSearch/"}}
        onHttpError={(err) => console.log("HTTPERR", err)}
        ref={webViewRef}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        originWhitelist={['*']}
        onLoadEnd={() => console.log("LOAD ENDED")}
        onLoadStart={() => console.log("LOAD STARTED")}
        onShouldStartLoadWithRequest={(e) => {
          console.log(e)
          return true
        }}
        ignoreSslError={true}
      />

    </View>
  );
};

export default SubmitForm;
