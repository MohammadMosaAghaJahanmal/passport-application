import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Constant from '../../Constant';

const CollapseButton = (props = {onEdit, onSubmit, onDelete}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <View style={styles.container}>
      <TouchableOpacity
         activeOpacity={0.8}
        style={styles.collapseButton}
        onPress={() => setIsCollapsed(!isCollapsed)}>
        <Text style={{...styles.buttonText, ...{color: Constant.inputSecondary}}}>...</Text>
      </TouchableOpacity>

      {!isCollapsed && (
        <View style={styles.collapsedButtonsContainer}>
          <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={() => {
            setIsCollapsed(!isCollapsed)
            props.onDelete()
            }}>
            <Text style={{...styles.buttonText, ...{color: Constant.inputPrimary}}}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={{...styles.button, ...{marginHorizontal: 3}}} onPress={() => {
            setIsCollapsed(!isCollapsed)
            props.onEdit()
            }}>
            <Text style={{...styles.buttonText, ...{color: Constant.inputSecondary}}}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={() => {
            setIsCollapsed(!isCollapsed)
            props.onOpen()
            }}>
            <Text style={{...styles.buttonText, ...{color: Constant.primary}}}>Open</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={{...styles.button, ...{marginLeft: 3}}} onPress={() => {
            setIsCollapsed(!isCollapsed)
            props.onSubmit()
            }}>
            <Text style={{...styles.buttonText, ...{color: Constant.primary}}}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: "relative"
  },

  collapseButton: {
    backgroundColor: Constant.whiteGreen,
    elevation: 2,
    borderRadius: 15,
    height: 30,
    width: 30,
    alignItems: "center",
    marginTop: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  collapsedButtonsContainer: {
    flexDirection: "row",
    position: 'absolute',
    alignItems: "center",
    justifyContent: "center",
    top: -15,
    right: 42,
    zIndex: 9,
    backgroundColor: "rgba(39, 36, 37, 0.1)",
    width: 260,
    justifyContent: "center",
    alignContent: "center",
    borderRadius: 10,
    paddingTop: 5
  },
  button: {
    backgroundColor: Constant.whiteGreen,
    elevation: 2,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
});

export default CollapseButton;
