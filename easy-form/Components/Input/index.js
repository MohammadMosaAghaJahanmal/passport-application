import React, { memo } from 'react';
import {View, StyleSheet, Text, TextInput} from 'react-native';
import Colors from '../../Constant';
const Input = (props = {label, style, placeholder, onChange, value, inputStyle, multiline}) =>
{

  return (
    <View style={{...styles.container, ...props.style}}>
      {
        props.label &&
        <Text style={styles.text}>{props.label || "Label"}</Text>
      }
      <TextInput
        style={{...styles.input, ...props?.inputStyle}} 
        placeholder={props.placeholder || props.label} 
        onChangeText={props.onChange}
        maxLength={props.maxLength} 
        value={props.value}
        multiline={props.multiline}
        keyboardType={props.keyboardType}
      />
    </View>
  )
};


const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input:
  {
    borderWidth: 2,
    borderColor: Colors.secondary,
    width: "100%",
    alignSelf:"center",
    fontSize: 16,
    padding: 10,
    borderRadius: 5,
    backgroundColor: Colors.whiteGreen,
    color: Colors.secondary,
    elevation: 2,
  },
  text: {
    color: Colors.secondary,
    fontWeight: "600",
    marginBottom: 2,
  }

})


export default memo(Input, (prev, next) => (
  prev.placeholder === next.placeholder &&
  prev.value === next.value &&
  prev.label === next.label
));