import React, { memo } from 'react';
import {View, StyleSheet} from 'react-native';

const Container = (props) =>
{
    return (
        <View style={{...styles.container, ...props.style}}>
            {props.children}
        </View>
    )
}

const styles = StyleSheet.create({

})

export default memo(Container);