import React, {  useEffect, useState } from 'react';
import {View, StyleSheet, Dimensions, StatusBar} from 'react-native';
import Forms from '../Forms';
import Applications from '../Applications';
import SubmitForm from '../SubmitForm';

const Home = (props) =>
{

  const [showApplication, setShowApplication] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    show: false,
    barCode: "",
    date: ""
});

  const [navBarHeight, setNavBarHeight] = useState(0);
  useEffect(() => {
    (async () => {
      const screenHeight = Dimensions.get('screen').height;
      const windowHeight = Dimensions.get('window').height;
      const navbarHeight = screenHeight - (windowHeight + StatusBar.currentHeight + 17);
      setNavBarHeight(navbarHeight);
    })()
  }, []);

  return (
    <View style={{...styles.container, paddingBottom: navBarHeight}}>
      {
        showApplication ?
        <Applications onModalChange={setShowApplication}/>
        :
        submitForm.show ?
        <SubmitForm onSubmitForm={setSubmitForm} {...submitForm} />
        :
        <Forms onModalChange={setShowApplication} onSubmitForm={setSubmitForm} />
      }
    </View>
  )
};


const styles = StyleSheet.create({
  container: {
    height: 100,
    flex: 1,
  },
})


export default Home;