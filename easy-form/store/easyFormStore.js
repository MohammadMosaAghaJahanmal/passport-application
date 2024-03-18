import {initState} from './store';

const easyFormStore = () =>
{

  const setData = ({type, data}, globalState) => ({[type]: data});

  const initialState = (payload, globalState) => ({
    applications: [],
    provinces: [],
    newforms: [],
  });
  
  return initState({
    initialState, 
    setData, 
  })
}


export default easyFormStore;