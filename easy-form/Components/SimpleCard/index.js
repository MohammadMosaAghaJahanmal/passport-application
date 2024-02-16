import React from 'react';
import {View, StyleSheet} from 'react-native';

const Card = (props) =>
{
    return (
    <View style={{...styles.card, ...props.style}}>
        {props.children}
    </View>
    )
}

const styles = StyleSheet.create({
    card:
    {
        shadowColor: "black",
        shadowOpacity: .5,
        shadowOffset: {height: 0, width: 2},
        shadowRadius: 5,
        elevation: 2,
        paddingHorizontal: 30,
        paddingVertical: 30,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "white"
    },
});





export default Card;