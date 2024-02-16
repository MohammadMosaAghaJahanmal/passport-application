import React, { useContext } from 'react';
import { AuthContext } from '../../authContext';
import Home from '../Home';
import FullScreenLoader from '../../Components/FullScreenLoader';
import Login from '../Login';
const Wrapper = (props) =>
{
  const {loading, login} = useContext(AuthContext);


  if(loading)
    return <FullScreenLoader label="Please Wait..." />

  if(!login)
    return <Login />
  

  return <Home /> 
};



export default Wrapper;