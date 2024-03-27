import React, { memo } from 'react';
import {View, StyleSheet, Text, ScrollView, Alert} from 'react-native';
import Constant, { afghanistanProvinces } from '../../Constant';
import CollapseButton from '../CollapseButton';



const FormsItem = (props) =>
{
  return (
    <View style={{...styles.container, ...props.style}} key={props.uxSerial}>
      <ScrollView horizontal>
        <View style={{...styles.item, ...styles.name}}>
          <Text style={styles.key}>Name</Text>
          <Text style={styles.value}>{props.data.uxGivenNamesLocal}</Text>
        </View>
        <View style={{...styles.item, ...styles.name}}>
          <Text style={styles.key}>Barcode</Text>
          <Text style={styles.value}>
            {props.data.uxCode}
          </Text>
        </View>
        <View style={{...styles.item, ...styles.name}}>
          <Text style={styles.key}>Date</Text>
          <Text style={styles.value}>{props.data.uxBirthDate_Shamsi}</Text>
        </View>
        <View style={{...styles.item, ...styles.name}}>
          <Text style={styles.key}>Tazkira</Text>
          <Text style={styles.value}>{props.data.uxSerial}</Text>
        </View>
        <View style={{...styles.item, ...styles.name}}>
          <Text style={styles.key}>Province</Text>
          <Text style={styles.value}>{afghanistanProvinces.find(per => per.id == props.data.axLocationID)?.province}</Text>
        </View>
        <View style={{...styles.item, ...styles.action}}>
          <Text style={styles.key}>Action</Text>
            <CollapseButton
              onSubmit={()=>props.onSubmit(props.data)}
              onEdit={()=>props.onEdit(props.data)}
              onDelete={()=>props.onDelete(props.data.uxSerial)}
              onOpen={()=>props.onOpen(props.data)}
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
    paddingHorizontal: 5,
    paddingVertical: 7
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


export default memo(FormsItem)