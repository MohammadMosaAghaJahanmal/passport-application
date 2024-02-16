import React, { memo, useState } from 'react';
import { View,  StyleSheet, Text } from 'react-native';
import Input from '../Input';
import Button from '../Button';
import Constant from '../../Constant';

const NumberInput = (props) => {
  let maxValue = props.max;
  const [value, setValue] = useState(props.page);

  const handleIncrement = () => {
    if (value < maxValue) {
      let newValue = value + 1;
      setValue(newValue);
      props.onChange(newValue)
    }
  };

  const handleDecrement = () => {
    if (value > 1) {
      let newValue = value - 1;
      setValue(newValue);
      props.onChange(newValue)
    }
  };

  const handleChangeText = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setValue(parseInt(numericValue));
  };

  return (
    <View style={{...styles.row, ...styles.container}}>
      <View>
        <Text style={styles.text}>
          Total Apps: {props.total}
        </Text>
        <Text style={styles.text}>
          Page: {value} / {maxValue} / {props.thisPageApps.length}
        </Text>
      </View>
      <View style={{...styles.row, ...styles.container}}>
        <Input
          value={value.toString()}
          onChangeText={handleChangeText}
          keyboardType="numeric"
          maxLength={String(maxValue).length} 
          style={{width: 100}}
          inputStyle={{padding: 6}}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginLeft: 5 }}>
          <Button 
              label="-"
              onPress={handleDecrement} 
              style={{...styles.btn, ...{marginRight: 2}}}
              textStyle={{color: Constant.white}}
          />
          <Button
              label="+"
              onPress={handleIncrement} 
              style={styles.btn}
              textStyle={{color: Constant.white}}
          />
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container:
  {
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 5,
    paddingRight: 5,
  },
  btn: {
    width: 50,
    backgroundColor: Constant.inputPrimary,
  },
  row:
  {
    flexDirection: "row",
  },
  text: {
    color: Constant.inputPrimary,
    fontWeight: "bold",
    marginLeft: 10
  }
});

export default memo(NumberInput);
