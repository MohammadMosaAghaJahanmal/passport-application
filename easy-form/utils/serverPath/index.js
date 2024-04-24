// export default (path) => (new URL(`https://easyform.jahanmal.xyz/v1${path}`).href); 

// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default (path) => (new URL(`http://192.168.43.87:8080/v1${path}`).href); 
// let counter = 0;
// let ports = ['8080'];
export default async(path) => {
  // counter++;
  // let compare = (counter % ports.length);
  // console.log(counter, compare)
  // let balancerPort = ports[(compare === 0) ? (ports.length - 1) : (compare - 1) ];
  // console.log(balancerPort)
  // return (new URL(`http://192.168.43.87:${balancerPort}/v1${path}`).href)
  return (new URL(`http://192.168.43.87:8080/v1${path}`).href)
  // return (new URL(`${await AsyncStorage.getItem("SERVER_PATH")}/v1${path}`).href)
}; 