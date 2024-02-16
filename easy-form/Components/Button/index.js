import React from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity} from 'react-native';

const Button = ({style, label, textStyle, onPress, loading}) =>
{
    return (
        <TouchableOpacity onPress={onPress}  style={{...styles.button, ...style}} activeOpacity={0.7} disabled={loading}>
            {loading ?
                <ActivityIndicator color={'black'} style={{marginVertical: 1}}/>
                :
                <Text style={{...styles.buttonText, ...textStyle}}>{label}</Text>
            }
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: 
    {
        padding: 12,
        backgroundColor: "#eee",
        width: "100%",
        justifyContent: 'center',
        borderRadius: 5,
    },
    buttonText: 
    {
        fontSize: 16,
        textAlign: "center",
        fontWeight: "bold"
    },
})

export default Button;