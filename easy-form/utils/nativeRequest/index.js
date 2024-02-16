import RNFetchBlob from 'rn-fetch-blob';

const fetchApi = async (url) => {
  let response = await RNFetchBlob.config({
    trusty: true 
  }).fetch('GET', url)
  return response;

};


export default fetchApi;