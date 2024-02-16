import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Colors from '../constant/Colors';
const Loader = () =>
{
    return (
        <View style={styles.container}>
            <View style={styles.box}>
                <Text style={styles.text}>
                    Please Wait
                </Text>
                <ActivityIndicator 
                    size="large"
                    color={Colors.primary}
                />
            </View>
        </View>
    )
};


const styles = StyleSheet.create({
    container:
    {
        width: "100%",
        height: "100%",
        flex: 1,
        position: "absolute",
        zIndex: 999,
        backgroundColor: 'rgba(39, 174, 96, 0.5)',
        alignItems: 'center',
        justifyContent: "center"
    },
    text:
    {
        color: Colors.primary,
        fontFamily: "sans-bold",
        fontSize: 15,
        marginBottom: 50,
        textAlign: "center"
    },
    box:
    {
        width: 300,
        height: 300,
        alignSelf: "center",
        justifyContent: "center",
        backgroundColor: Colors.whiteGreen,
        elevation: 4,
        borderRadius: 150,
    }
});


export default Loader;