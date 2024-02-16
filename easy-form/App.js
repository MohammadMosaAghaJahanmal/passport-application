import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, } from 'react-native';
import Colors, {ScreenHeight, headHeight} from './Constant';
import AuthProvider from './authContext'
import Wrapper from './Screens/Wrapper';
import easyFormStore from './store/easyFormStore';
import {initializeDB} from './DB'
import Constant from './Constant';
initializeDB();
easyFormStore();
export default function App() {


  return (
    <AuthProvider>
      <View style={styles.container}>
        <Wrapper />
      </View>
      <StatusBar 
        backgroundColor={Constant.secondary} 
        animated
        hideTransitionAnimation={'slide'}
        translucent={true}
       />
    </AuthProvider>

  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: headHeight,
    paddingBottom: 15,
    height: ScreenHeight,
    backgroundColor: Colors.whiteGreen
  }
});
