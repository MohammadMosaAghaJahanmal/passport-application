import AsyncStorage from "@react-native-async-storage/async-storage";

const APPLICATIONS = "@APPLICATIONS";
const FORM_SECRETS = "FORM_SECRETS";
const LANG = "@lang";
const PROVINCES = "@PROVINCES";
const TOKEN = "@TOKEN";

export const insertMany = async(data = {}) =>
{
  try {
    await AsyncStorage.setItem(APPLICATIONS, JSON.stringify(data))
    return true
  } catch (error) {
    return false
  }
}

export const getAll = async() =>
{
  try {
    let data = await AsyncStorage.getItem(APPLICATIONS)
    if(!data)
      return [];
      
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}


export const getLang = async() =>
{
  try {
    let data = await AsyncStorage.getItem(LANG)
    if(!data)
      return 'en';
      
    return data
  } catch (error) {
    return 'en'
  }
}

export const setLang = async(lang) =>
{
  try {
   await AsyncStorage.setItem(LANG, lang)
    return true
  } catch (error) {
    return false
  }
}

export const getToken = async() =>
{
  try {
    let data = await AsyncStorage.getItem(TOKEN)
    if(!data)
      return null;
      
    return data
  } catch (error) {
    return null
  }
}

export const setToken = async(token) =>
{
  try {
   await AsyncStorage.setItem(TOKEN, token)
    return true
  } catch (error) {
    return false
  }
}

export const getProvinces = async() =>
{
  try {
    let data = await AsyncStorage.getItem(PROVINCES)
    if(!data)
      return [];
      
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

export const setProvince = async(provinces = []) =>
{
  try {
   await AsyncStorage.setItem(PROVINCES, JSON.stringify(provinces))
    return true
  } catch (error) {
    return false
  }
}

export const getSecrets = async() =>
{
  try {
    let data = await AsyncStorage.getItem(FORM_SECRETS)
    if(!data)
      return {
			__EVENTVALIDATION: "",
			__VIEWSTATE: ""
    };
      
    return JSON.parse(data)
  } catch (error) {
    return {
			__EVENTVALIDATION: "",
			__VIEWSTATE: ""
    }
  }
}

export const setSecrets = async(secrets = {}) =>
{
  try {
   await AsyncStorage.setItem(FORM_SECRETS, JSON.stringify(secrets))
    return true
  } catch (error) {
    return false
  }
}