import React from 'react';
import {View, StyleSheet} from 'react-native';
import Constant from '../../Constant';
const Shape = (props) =>
{

  return (
    <View style={{...styles.container, ...props.style}}></View>
  )
};


const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: Constant.secondary,
    zIndex: 999
  },

})


export default Shape;