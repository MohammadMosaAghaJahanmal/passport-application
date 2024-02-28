import {DOMParser} from 'react-native-html-parser'
function extractKeysFromHTML(html = "") {
  try {
    
  const doc = new DOMParser()?.parseFromString(html, 'text/html');
  const __EVENTVALIDATION = doc?.getElementsByAttribute('id', '__EVENTVALIDATION');
  const __VIEWSTATE = doc?.getElementsByAttribute('id', "__VIEWSTATE");
  const secrets = {
    __VIEWSTATE: __VIEWSTATE[0]?.attributes[3]?.nodeValue,
    __EVENTVALIDATION: __EVENTVALIDATION[0]?.attributes[3]?.nodeValue,
  }
  return secrets;
} catch (error) {
    return {};
}
};

export default extractKeysFromHTML;