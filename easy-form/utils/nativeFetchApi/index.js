import RNFetchBlob from 'rn-fetch-blob';

const nativeFetchApi = async ({url, method, headers, body}) => {
  console.log(url, method, headers, body)
  let response = await RNFetchBlob.config({
    trusty: true 
  }).fetch(method, url, headers, body)
  return response;

};


export default nativeFetchApi;