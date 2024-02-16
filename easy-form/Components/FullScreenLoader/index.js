import React, { useEffect } from 'react';
import {View, Text, StyleSheet, ActivityIndicator, BackHandler} from 'react-native';
import Shape from '../Shape';
const FullScreenLoader = (props) =>
{
  
  useEffect(() => {
    let subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      return true;
    });
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", subscription)
  }, []);


  return (
    <View style={{...styles.container, ...props.style}}>
      <Shape style={{top: -100, right: -100, ...props.shapeStyle}} />
      <Shape style={{top: -100, left: -100, ...props.shapeStyle}} />
      <Shape style={{bottom: -100, right: -100, ...props.shapeStyle}} />
      <Shape style={{bottom: -100, left: -100, ...props.shapeStyle}} />
      <View style={{...styles.loaderCard, ...props.cardStyle}}>
        <ActivityIndicator size={'large'} color={"dodgerblue"} />
        <Text style={styles.text}>{props.label || "Please Wait"}</Text>
      </View>
    </View>
  )
};


const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },
  loaderCard: {
    padding: 30,
    elevation: 4,
    backgroundColor: "white",
    borderRadius: 5,
  },
  text: {
    color: "dodgerblue",
    marginTop: 5
  }
})


export default FullScreenLoader;