let token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOnsidG9rZW5JZCI6M30sImlhdCI6MTcwNzg3OTY1MiwiZXhwIjoxNzk0Mjc5NjUyfQ.PUnDQbmq4Vi4i39XbS90k5xdK03cvu-IS4feEO5Yt3k`;
function createELM(tagName) {
  return document.createElement(tagName);
}
// let counter  = 0;
let serverPath = (path) => {
  // counter++;
  // let compare = (counter % ports.length);
  // console.log(counter, compare)
  // let balancerPort = ports[(compare === 0) ? (ports.length - 1) : (compare - 1) ];
  // console.log(balancerPort)
  // return (new URL(`http://192.168.43.87:${balancerPort}/v1${path}`).href)
  return (new URL(`http://localhost:8080/v1${path}`).href)
  // return (new URL(`${await AsyncStorage.getItem("SERVER_PATH")}/v1${path}`).href)
}; 
function generateRandomString(length, type) {
  let characters = '';

  if (type === 'en') {
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  } else if (type === 'ps') {
    characters = 'پبتثجچحخدذرزژسشصضطظعغفقکگلمنوهی';
  } else if (type === 'num') {
    characters = '0123456789';
  } else {
    throw new Error('Invalid type. Type must be "en" for English, "ps" for Pashto, and "num" for numbers.');
  }

  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}



const initFieldsState = ({axLocationID, uxBirthLocationID, uxResidenceCountryID}) => ({
  uxTitleID:"1",
  uxCriminalRecord:"2",
  uxFamilyNameLocal:generateRandomString(8, "ps"),
  uxFamilyName:generateRandomString(8, "en"),
  uxGivenNamesLocal:generateRandomString(8, "ps"),
  uxGivenNames:generateRandomString(8, "en"),
  uxFatherNameLocal:generateRandomString(8, "ps"),
  uxFatherName:generateRandomString(8, "en"),
  uxGrandFatherNameLocal:generateRandomString(8, "ps"),
  uxGrandFatherName:generateRandomString(8, "en"),
  uxBirthDate_Shamsi:"1380/01/01",
  uxBirthDate:"2001-03-21",
  uxProfessionID:"22",
  _Profession:"22",
  uxBirthLocationID:uxBirthLocationID || "31",
  uxResidenceCountryID:uxResidenceCountryID || "31",
  uxMaritalStatusID:"1",
  uxNIDTypeID:"11",
  uxSerial:generateRandomString(10, "num"),
  uxJuld:"",
  uxPage:"",
  uxNo:"",
  uxNID:generateRandomString(10, "num"),
  uxGenderID:"1",
  uxHairColorID:"1",
  uxEyeColorID:"1",
  uxBodyHeightCM:"170",
  uxCode:"",
  axFullAddress: generateRandomString(10, "ps"),
  axPrimaryMobile: '0712312312',
  axLocationID: axLocationID || "31",
  ucaDurationTypeID: "1",
  ucaPaymentTypeID: "1",
});

function submitData(appForms = [], passport) {


  appForms.forEach((per, index) => {
    fetch(serverPath('/easyform/application'), {
      method: 'POST',
      headers:
      {
        "Content-Type": "Application/json",
        "Authorization": `bearer ${token}`,
      },
      body: JSON.stringify({
        ...per,
        ...passport
      }),
    })
    .then(res => res.json())
    .then(res => console.log(res, {
      uxGivenNamesLocal: per.uxGivenNamesLocal,
      uxFatherNameLocal: per.uxFatherNameLocal,
      uxGrandFatherNameLocal: per.uxGrandFatherNameLocal,
      uxBirthDate_Shamsi: per.uxBirthDate_Shamsi,
    } ))
    .catch(err => console.error(err.message))

  })
}

// ////////////////////////////////////////////////////////////////////////


const counteInput = document.getElementById("counte")
const uxBirthLocationID = document.getElementById("uxBirthLocationID")
const uxResidenceCountryID = document.getElementById("uxResidenceCountryID")
const axLocationID = document.getElementById("axLocationID")
const submit = document.getElementById("submit")
const validate = document.getElementById("validate")

let allData = [];

submit.addEventListener('click', (e) => {

  const passport = JSON.parse(localStorage.getItem("passport"));
  if(!passport || !passport?.__VIEWSTATE )
    return alert("Please Validate your Application");

  let parseCounte = counteInput.value;
  parseCounte = Number.parseInt(parseCounte);
  const uxBirthLocationIDValue = uxBirthLocationID.value;
  const uxResidenceCountryIDValue = uxResidenceCountryID.value;
  const axLocationIDValue = axLocationID.value;
  
  let counte = parseCounte > 1 ? parseCounte : 1;
  allData = [];
  for (let i = 0; i < counte; i++) {
    let appData = {
      ...initFieldsState({axLocationID: axLocationIDValue, uxBirthLocationID: uxBirthLocationIDValue, uxResidenceCountryID: uxResidenceCountryIDValue}), 
    }
    appData.uxNID = JSON.stringify({S: appData.uxSerial, J: appData.uxJuld, P: appData.uxPage, N:appData.uxNo})
    allData.push(appData)
  }
  localStorage.setItem((generateRandomString(8, "en") + "_" + parseCounte), JSON.stringify(allData))

  console.log(allData)
  submitData(allData, passport)
})

validate.addEventListener("click", loadKeys)
async function loadKeys(e) {
  try {
    const response = await fetch('https://passport.moi.gov.af/BarcodeSearch/');
    const text = await response.text();
    const HTML_ELM = createELM("html");
    HTML_ELM.insertAdjacentHTML("afterbegin", text);
    const newViewState = HTML_ELM?.querySelector("#__VIEWSTATE");
    const newEventValidation = HTML_ELM?.querySelector("#__EVENTVALIDATION");
    

    if(!newViewState?.value || !newEventValidation?.value)
      return alert("تېروتنه. د فورمی باوری کولو تڼی بیا کښیکاږی");

    alert("په بریالیتوب سره باوری شوه");
    const passport = {
      __VIEWSTATE: newViewState.value,
      __EVENTVALIDATION: newEventValidation.value
    };
    window.localStorage.setItem("passport", JSON.stringify(passport));
  } catch (error) {
    alert("تېروتنه بیاکوښښ وکی " + error.message);
  }
}