import React, {  useEffect, useState } from 'react';
import {View, StyleSheet, Dimensions, StatusBar} from 'react-native';
import Forms from '../Forms';
import Applications from '../Applications';
import SubmitForm from '../SubmitForm';
import NewApplication from '../NewApplication';
import NewForms from '../NewForms';

const Home = (props) =>
{

  const [showApplication, setShowApplication] = useState(false);
  const [newApplication, setNewApplication] = useState(false);
  const [newForms, setNewForms] = useState(false);
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
        newForms ?
        <NewForms onNewForms={setNewForms} />
        :
        newApplication ?
        <NewApplication onNewApplication={setNewApplication} />
        :
        showApplication ?
        <Applications onModalChange={setShowApplication}/>
        :
        submitForm.show ?
        <SubmitForm onSubmitForm={setSubmitForm} {...submitForm} />
        :
        <Forms 
          onModalChange={setShowApplication} 
          onSubmitForm={setSubmitForm} 
          onNewApplication={setNewApplication} 
          onNewForms={setNewForms}
        />
      }
    </View>
  )
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})


export default Home;