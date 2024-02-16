import React, { memo } from 'react';
import {View, StyleSheet, Text, ScrollView, Alert} from 'react-native';
import Constant from '../../Constant';
import CollapseButton from '../CollapseButton';



const ListItem = (props = { 
  name, 
  barCode, 
  date, 
  checked, 
  style, 
  province, 
  onSubmit,
  onEdit,
  onDelete,
  onOpen
}) =>
{
  return (
    <View style={{...styles.container, ...props.style}} key={props.barCode}>
      <ScrollView horizontal>
        <View style={{...styles.item, ...styles.name}}>
          <Text style={styles.key}>OK</Text>
          <Text style={{...styles.value, ...{fontSize: 17}}}>{props.checked ? "☑" : "☐"}</Text>
        </View>
        <View style={{...styles.item, ...styles.name}}>
          <Text style={styles.key}>Name</Text>
          <Text style={styles.value}>{props.name}</Text>
        </View>
        <View style={{...styles.item, ...styles.name}}>
          <Text style={styles.key}>Barcode</Text>
          <Text style={styles.value}>
            {props.barCode}
          </Text>
        </View>
        <View style={{...styles.item, ...styles.name}}>
          <Text style={styles.key}>Date</Text>
          <Text style={styles.value}>{props.date}</Text>
        </View>
        <View style={{...styles.item, ...styles.name}}>
          <Text style={styles.key}>Province</Text>
          <Text style={styles.value}>{props.province || "Kandahar"}</Text>
        </View>
        <View style={{...styles.item, ...styles.action}}>
          <Text style={styles.key}>Action</Text>
            <CollapseButton
              onSubmit={()=>props.onSubmit({date: props.date, barCode: props.barCode, province: (props.province || "Kandahar"), checked: props.checked, name: props.name})}
              onEdit={()=>props.onEdit({date: props.date, barCode: props.barCode, province: (props.province || "Kandahar"), checked: props.checked, name: props.name})}
              onOpen={()=>props.onOpen({date: props.date, barCode: props.barCode})}
              onDelete={()=>props.onDelete(props.barCode)}
            />
        </View>
      </ScrollView>
    </View>
  )
};


const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: Constant.white,
    position: "relative",
    marginBottom: 2
  },
  key:
  {
    padding: 5,
    color: Constant.inputPrimary,
    fontWeight: "bold",
    borderBottomColor: "rgba(0, 0, 0, .1)",
    borderBottomWidth: 1,
  },
  value:
  {
    padding: 5,
  },
  item:
  {
    backgroundColor: Constant.simpleWhiteGreen,
    padding: 5,
    width: "100%",
    flex: 1,
    flexBasis: 1,
  },
  action:
  {
    padding: 0,
    paddingTop: 5,
  }
})


export default memo(ListItem)