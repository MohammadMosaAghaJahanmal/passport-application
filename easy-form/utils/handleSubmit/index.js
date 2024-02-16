import {Linking, Alert} from 'react-native';
import axios from 'axios';

const handleSubmit = async (data = [{}]) => {
  // Form data
  const formData = new FormData();
  const fields = {};
  data.forEach((value) => {
    formData.append(value.key, value.value);
    fields[value.key] = value.value;
  })
  formData.append("__VIEWSTATEGENERATOR", "768A9483")
  fields["__VIEWSTATEGENERATOR"] = "768A9483"
  
  const url = 'http://passport.moi.gov.af/BarcodeSearch/';

  try {
    const {data} = await axios.post(url, fields, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    console.log(data);

  } catch (error) {
    console.error(error)
    Alert.alert('Network error:', error.message);
  }

};

export default handleSubmit;