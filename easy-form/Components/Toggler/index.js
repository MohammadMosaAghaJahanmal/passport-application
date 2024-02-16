import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';

const Toggler = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleAnim = new Animated.Value(0);

  const handleToggle = () => {
    setIsEnabled(!isEnabled);
    Animated.timing(toggleAnim, {
      toValue: isEnabled ? 0 : 1,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const toggleColor = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#007bff', '#dc3545'],
  });

  const toggleTranslateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Adjust the value as per your need
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleToggle} activeOpacity={0.8}>
        <Animated.View
          style={[
            styles.toggleButton,
            { backgroundColor: toggleColor, transform: [{ translateX: toggleTranslateX }] },
          ]}
        >
          <Text style={styles.buttonText}>{isEnabled ? 'ON' : 'OFF'}</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: 50,
    height: 50
  },
  toggleButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Toggler;
