import Constants from "expo-constants";
import { Dimensions } from "react-native";
import serverPath from "../utils/serverPath";

export default Colors = {
    primary: '#27AE60',
    secondary: "#48C9B0",
    simpleGreen: "#2ECC71",
    simpleWhiteGreen: "#91ffbf",
    inputPrimary: 'rgb(255, 128, 149)',
    inputSecondary: '#FFA07A',
    white: "white",
    whiteGreen: "#defdee"
}

export const headHeight = Constants.statusBarHeight;
// export const headHeight = 0;
export const ScreenWidth = Dimensions.get("screen").width;
export const ScreenHeight = Dimensions.get("screen").height;



export const createForm = ({barCode, date, __EVENTVALIDATION, __VIEWSTATE}) => {
    const formData = new FormData();
    formData.append("__VIEWSTATEGENERATOR", "768A9483");
    formData.append("__EVENTVALIDATION", __EVENTVALIDATION);
    formData.append("__SCROLLPOSITIONX", "0");
    formData.append("__SCROLLPOSITIONY", "0");
    formData.append("__EVENTARGUMENT", "");
    formData.append("__EVENTTARGET", "");
    formData.append("__VIEWSTATE", __VIEWSTATE);
    formData.append("uxBirthDate", date);
    formData.append("uxSearch", "جستجو");
    formData.append("uxCode", barCode);

    return formData
}


export const APPLICATIONS = [
    {"name":"Sami","barCode":"P31072016211023001","date":"1395/04/19"},
    {"name":"Daymah","barCode":"P31082019211023001","date":"1398/05/19"},
    {"name":"Oqba","barCode":"P31042018211023004","date":"1397/01/19"},
    {"name":"Samim","barCode":"P31122023190124001","date":"1402/09/29","checked":true},
    {"name":"Salih","barCode":"P31102021281023003","date":"1400/08/05"},
    {"name":"Ozair","barCode":"P31032021281023001","date":"1400/01/01"},
    {"name":"Nadia","barCode":"P31092007281023002","date":"1386/06/31"},
    {"name":"Sabila","barCode":"P31042003281023001","date":"1382/01/15"},
    {"name":"Mastoora","barCode":"P31032001281023002","date":"1380/01/09"},
    {"name":"Dummy","barCode":"P31022010230124001","date":"1388/11/18"},
]
    // <form method="post" action="${serverPath("/barcode")}" id="form2" target="_blank">

export const form = ({barCode, date, __EVENTVALIDATION, __VIEWSTATE, URL}) => {
    let HTML_TEXT = `
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
  
      <title>
        Easy Form
      </title>
    </head>
  
  <body>

  <form method="post" action="http://passport.moi.gov.af/BarcodeSearch/" id="form2" style='display: none'>
        
      <div class="aspNetHidden">
        <input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="${__VIEWSTATE}">
      </div>
  
  
  
      <div class="aspNetHidden">
        <input type="hidden" name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="768A9483">
        <input type="hidden" name="__SCROLLPOSITIONX" id="__SCROLLPOSITIONX" value="0">
        <input type="hidden" name="__SCROLLPOSITIONY" id="__SCROLLPOSITIONY" value="0">
        <input type="hidden" name="__EVENTTARGET" id="__EVENTTARGET" value="">
        <input type="hidden" name="__EVENTARGUMENT" id="__EVENTARGUMENT" value="">
        <input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="${__EVENTVALIDATION}">
      </div>
  
      <div class="form-group">
        <span id="uxMessage"></span>
      </div>
      <div class="form-group">
        <div class="labelReq">
          <span id="Label70" class="aspLabel">بارکود</span>
          <span class="redSpan">*</span>
        </div>
        <input name="uxCode" value="${barCode}" type="text" maxlength="50" id="uxCode" class="form-control" rule="{fn:'required'}" required="" >
      </div>
      <div class="form-group">
        <div class="labelReq">
          <span id="Label3" class="aspLabel">تاریخ تولد به شمسی</span>
          <span class="redSpan">*</span>
        </div>
        <input name="uxBirthDate" value="${date}" type="text" maxlength="50" id="uxBirthDate" class="form-control date hasCalendarsPicker" rule="{fn:'required'}" required="" placeholder="تاریخ تولد خود را نظر به فورم وارد کنید">
      </div>
      <div class="form-btn">
        <input type="submit" name="uxSearch" value="جستجو" id="uxSearch" class="submit-btn">
      </div>
    </form>
    <script>
      const submit = document.querySelector("#uxSearch")
      submit.click()
      document.body.remove()
    </script>
  </body>
  </html>
`
    return HTML_TEXT;
}
export const searchForm = ({uxGivenNamesLocal, uxFatherNameLocal, uxGrandFatherNameLocal, uxBirthDate_Shamsi, __EVENTVALIDATION, __VIEWSTATE, URL}) => {
    let HTML_TEXT = `
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
  
      <title>
        Easy Form
      </title>
    </head>
  
  <body>

  <form method="post" action="https://passport.moi.gov.af/search/" id="form2" style='display: none'>
        
      <div class="aspNetHidden">
        <input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="${__VIEWSTATE}">
      </div>
  
  
  
      <div class="aspNetHidden">
        <input type="hidden" name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="59A49A67">
        <input type="hidden" name="__SCROLLPOSITIONX" id="__SCROLLPOSITIONX" value="0">
        <input type="hidden" name="__SCROLLPOSITIONY" id="__SCROLLPOSITIONY" value="300">
        <input type="hidden" name="__EVENTTARGET" id="__EVENTTARGET" value="">
        <input type="hidden" name="__EVENTARGUMENT" id="__EVENTARGUMENT" value="">
        <input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="${__EVENTVALIDATION}">
      </div>
  
      <div class="form-group">
        <span id="uxMessage"></span>
      </div>
      <div class="form-group">
        <input name="uxName" value="${uxGivenNamesLocal}" type="text" maxlength="50" id="uxName" class="form-control input DariValidator" rule="{fn:'required'}" datatextfield="Dari" required="" placeholder="اسم خود را نظر به فورم وارد کنید">
      </div>
      <div class="form-group">
        <input name="uxFatherName" value="${uxFatherNameLocal}" type="text" maxlength="50" id="uxFatherName" class="form-control input DariValidator" rule="{fn:'required'}" datatextfield="Dari" required="" placeholder="ولد خود را نظر به فورم وارد کنید">
      </div>
      <div class="form-group">
        <input name="uxGrandFatherName" value="${uxGrandFatherNameLocal}" type="text" maxlength="50" id="uxGrandFatherName" class="form-control input DariValidator" rule="{fn:'required'}" datatextfield="Dari" required="" placeholder="ولدیت خود را نظر به فورم وارد کنید">
      </div>
      <div class="form-group">
        <input name="uxBirthDate" value="${uxBirthDate_Shamsi}" type="text" maxlength="50" id="uxBirthDate" class="form-control date hasCalendarsPicker" rule="{fn:'required'}" required="" placeholder="تاریخ تولد خود را نظر به فورم وارد کنید">
      </div>
      <div class="form-btn">
        <input type="submit" name="uxSearch" value="جستجو" id="uxSearch" class="submit-btn">
      </div>
    </form>
    <script>
      const submit = document.querySelector("#uxSearch")
      submit.click()
      document.body.remove()
    </script>
  </body>
  </html>
`
    return HTML_TEXT;
}

// export const submitFormByBrowser = async ({barCode, date, __EVENTVALIDATION, __VIEWSTATE}) =>
// {
//   try {
//     // const baseUrl = 'http://passport.moi.gov.af/BarcodeSearch/';
//     const baseUrl = 'https://1024-2a09-bac5-3b-137d-00-1f1-226.ngrok-free.app/barcode';

//     const formData = new FormData();
//     formData.append("__VIEWSTATEGENERATOR", "768A9483");
//     formData.append("__EVENTVALIDATION", __EVENTVALIDATION);
//     formData.append("__SCROLLPOSITIONX", "0");
//     formData.append("__SCROLLPOSITIONY", "0");
//     formData.append("__EVENTARGUMENT", "");
//     formData.append("__EVENTTARGET", "");
//     formData.append("__VIEWSTATE", __VIEWSTATE);
//     formData.append("uxBirthDate", date);
//     formData.append("uxSearch", "جستجو");
//     formData.append("uxCode", barCode);
//     formData.append("axLocationID", "25");

//     // console.log(formData)

//     const response = await fetch(baseUrl, {
//         method: 'POST',
//         body: formData
//     });

//     // const text = await response.text();
    
//     // console.log(text);


//     return await response.json();

//   } catch (error) {
//     return {status: "failure", message: error.message}
//   }
    
// }
export const submitFormByBrowser = async ({barCode, date, __EVENTVALIDATION, __VIEWSTATE, axLocationID, token, name}) =>
{
  try {
    const baseUrl = await serverPath('/easyform/barcode');
    
    // console.log(formData)

    const response = await fetch(baseUrl, {
        method: 'POST',
        headers:
        {
          "Content-Type": "Application/json",
          "Authorization": `bearer ${token}`,
        },
        body: JSON.stringify({
          __VIEWSTATEGENERATOR: "768A9483",
          __EVENTVALIDATION: __EVENTVALIDATION,
          __SCROLLPOSITIONX: "0",
          __SCROLLPOSITIONY: "500",
          __EVENTARGUMENT: "",
          __EVENTTARGET: "",
          __VIEWSTATE: __VIEWSTATE,
          uxBirthDate: date,
          uxSearch: "جستجو",
          uxCode: barCode,
          name: name,
          axLocationID: axLocationID || 31,
        }),
    });

    if(response.status === 500)
      return {statusCode: response.status}

    const objData = await response.json();
    return {...objData}

  } catch (error) {
    console.log(error)
    return {status: "failure", message: error.message}
  }
    
}

export const submitNewApplication = async ({
  barCode, 
  date, 
  __EVENTVALIDATION, 
  __VIEWSTATE, 
  axLocationID, 
  token, 
  name, 
  axFullAddress,
  axPrimaryMobile,
  ucaDurationTypeID,
  ucaPaymentTypeID
}) =>
{
  try {
    const baseUrl = await serverPath('/easyform/submitform');
    
    // console.log(formData)

    const response = await fetch(baseUrl, {
        method: 'POST',
        headers:
        {
          "Content-Type": "Application/json",
          "Authorization": `bearer ${token}`,
        },
        body: JSON.stringify({
          __VIEWSTATEGENERATOR: "768A9483",
          __EVENTVALIDATION: __EVENTVALIDATION,
          __SCROLLPOSITIONX: "0",
          __SCROLLPOSITIONY: "0",
          __EVENTARGUMENT: "",
          __EVENTTARGET: "",
          __VIEWSTATE: __VIEWSTATE,
          uxBirthDate: date,
          uxSearch: "جستجو",
          uxCode: barCode,
          name: name,
          axLocationID: axLocationID || 31,
          axPrimaryMobile: axPrimaryMobile,
          axFullAddress: axFullAddress,
          submitForm: {
            appSave: "ثبت",
            ucaTypeID: "1",
            ucaFineTypeID: "1",
            ucaApplicationTypeID: "1",
            ucaDurationTypeID: ucaDurationTypeID || "1",
            ucaPaymentTypeID: ucaPaymentTypeID || "1",
          }
        }),
    });

    if(response.status === 500)
      return {statusCode: response.status}

    const objData = await response.json();
    return {...objData}

  } catch (error) {
    console.log(error)
    return {status: "failure", message: error.message}
  }
    
}


export const afghanistanProvinces = [
  { province: "Badakhshan", id: 16 },
  { province: "Badghis", id: 32 },
  { province: "Baghlan", id: 10 },
  { province: "Balkh", id: 27 },
  { province: "Bamyan", id: 11 },
  { province: "Daykundi", id: 22 },
  { province: "Farah", id: 34 },
  { province: "Faryab", id: 29 },
  { province: "Ghazni", id: 12 },
  { province: "Ghor", id: 21 },
  { province: "Helmand", id: 30 },
  { province: "Herat", id: 33 },
  { province: "Jowzjan", id: 28 },
  { province: "Kabul", id: 2 },
  { province: "Kandahar", id: 31 },
  { province: "Kapisa", id: 3 },
  { province: "Khost", id: 26 },
  { province: "Kunar", id: 14 },
  { province: "Kunduz", id: 18 },
  { province: "Laghman", id: 8 },
  { province: "Logar", id: 6 },
  { province: "Nangarhar", id: 7 },
  { province: "Nimroz", id: 35 },
  { province: "Nuristan", id: 15 },
  { province: "Paktia", id: 13 },
  { province: "Paktika", id: 25 },
  { province: "Panjshir", id: 9 },
  { province: "Parwan", id: 4 },
  { province: "Samangan", id: 19 },
  { province: "Sar-e Pol", id: 20 },
  { province: "Takhar", id: 17 },
  { province: "Urozgan", id: 23 },
  { province: "Wardak", id: 5 },
  { province: "Zabul", id: 24 },
  { province: "Dar", id: 1384 },
  { province: "Tar", id: 1385 },
  { province: "Zam", id: 1386 },
];

export const passportDuration = [
  { type: "5 Years", value: "1" },
  { type: "10 Years", value: "2" },
];

export const applicantAge = [
  { type: "Older Than 14", value: "1" },
  { type: "Less Than 15", value: "3" },
];

export const passportTitle = [
  { type: "Sir", value: "1" },
  { type: "Mrs./Miss", value: "2" },
];

export const passportType = [
  { type: "New", value: "2" },
  { type: "Renewal", value: "3" },
];

export const job = [
  { type: "Doesn't have", value: "22" },
];

export const maritalStatus = [
  { type: "Single", value: "1" },
  { type: "Married", value: "2" },
  { type: "Widow", value: "3" },
];

export const typeOfIdentity = [
  { type: "Tazkira", value: "8"},
  { type: "Birth Card", value: "9"},
  { type: "Electronic Tazkira", value: "11"},
];


export const gender = [
  { type: "Male", value: "1" },
  { type: "Female", value: "2" },
  { type: "Other", value: "3" },
];

export const passportColors = [
  { type: "Black", value: "1" },
  { type: "Yellow", value: "2" },
  { type: "Brown", value: "3" },
  { type: "Red", value: "4" },
  { type: "Gray", value: "5" },
  { type: "Blue", value: "7" },
  { type: "Green", value: "8" },
  { type: "White", value: "10" },
  { type: "Other", value: "11" },
];

