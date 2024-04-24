import React, { useEffect, useState } from 'react';
import languages from '../localization';
import DeviceInfo from 'react-native-device-info';
import useStore from '../store/store';
import {setLang, getSecrets, getProvinces, getToken} from '../LocalStorage';
import {createTables, getApplications, getForms} from '../DB'
import serverPath from '../utils/serverPath';
import NetInfo from '@react-native-community/netinfo';
import FullScreenLoader from '../Components/FullScreenLoader';
const initialState = {
	tokenInfo: null,
	token: null,
	login: false,
	loading: true,
	backendRequet: true,
	deviceInfo: null,
	secrets: {
			__EVENTVALIDATION: "",
			__VIEWSTATE: ""
	}
};
export const AuthContext = React.createContext({
	...initialState,
	initialState: {...initialState},
	setAuth: (prev) => {},
	setLanguage: (langCode) => {},
	languageCode: "en" || "ps"
});


const AuthProvider = (props) =>
{

	const [auth, setAuth] = useState({...initialState});
	const [languageCode, setLanguageCode] = useState("en");
	const dispatch = useStore(false)[1];
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() =>
	{
		(async() =>
		{

			let combinedId;
			await createTables();
			if(!auth.backendRequet)
			{
				try {
					const deviceId = await DeviceInfo.getUniqueId();
					const manufacturer = await DeviceInfo.getManufacturer();
					const model = DeviceInfo.getModel();
					combinedId = `${deviceId}-${manufacturer}-${model}`
					let token = await getToken()
					if(!token)
						return setAuth((prev) => ({...prev, loading: false, login: false, deviceInfo: combinedId}));
					
					const authResp = await fetch(await serverPath('/auth/easyform/token'), {
						method: "POST",
						headers: {
							"Content-Type": "Application/JSON",
							"Authorization": `bearer ${token}`
						},
						body: JSON.stringify({deviceInfo: combinedId})
					});
					
					const objData = await authResp.json();
					if(objData.status === 'failure')
						return setAuth((prev) => ({...prev, loading: false, login: false, deviceInfo: combinedId}));

					let SECRETES = await getSecrets()
					setAuth((prev) => ({...prev, loading: false, login: true, deviceInfo: combinedId, token: token, secrets: SECRETES || prev.secrets, tokenInfo: objData.token}));


					// setAuth((prev) => ({...prev, loading: false, login: true, secrets: SECRETES || prev.secrets}));
				} catch (error) {
						console.log(error)
						return setAuth((prev) => ({...prev, loading: false, login: false, deviceInfo: combinedId}));
				}
			}
		})()
		
	}, [auth.backendRequet]);


	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener(state => {
			setIsConnected(state.isConnected);
			if(auth.backendRequet && state.isConnected)
				setAuth(prev => ({...prev, backendRequet: false}))
		});
	
		return () => {
			unsubscribe();
		};
	}, []);
	

	useEffect(() => {
		(async() => {
			if(auth.login)
			{
				let getAllApplications = await getApplications();
				if(getAllApplications)
					dispatch("setData", {type: "applications", data: getAllApplications});

				let getAllForms = await getForms();
				if(getAllForms)
					dispatch("setData", {type: "newforms", data: getAllForms});

				let provinces = await getProvinces();
				if(provinces)
					dispatch("setData", {type: "provinces", data: provinces});
			}
		})()

	}, [auth.login])


	const setLanguage = (langCode) =>
	{
			if (langCode == languageCode) {
					return
			}
			languages.setLanguage(langCode);
			setLanguageCode(langCode);
			setLang(langCode)
	}


	return (
			<AuthContext.Provider value={{
					...auth,
					initialState,
					setAuth,
					setLanguage,
					languageCode
				}}>
					{props.children}
					{!isConnected && 
					<FullScreenLoader 
						style={{
							width: "100%",
							height: "100%",
							position: "absolute",
							zIndex: 999999,
						}}
						cardStyle={{paddingBottom: 60, paddingTop: 60}}
						shapeStyle={{display: "none"}}
						label="No Internet Connection!"
					/>}
			</AuthContext.Provider>
	)
}


export default AuthProvider;