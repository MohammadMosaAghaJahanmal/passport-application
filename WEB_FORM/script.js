let token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOnsidG9rZW5JZCI6M30sImlhdCI6MTcwNzg3OTY1MiwiZXhwIjoxNzk0Mjc5NjUyfQ.PUnDQbmq4Vi4i39XbS90k5xdK03cvu-IS4feEO5Yt3k`;
let backupData = [];
let allDataForInfo = [];
let newBackup = [];
const afghanistanProvinces = [
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
];
function createELM(tagName) {
  return document.createElement(tagName);
}
let serverPath = (path) => {
  return (new URL(`http://localhost:8080/v1${path}`).href)
  // return (new URL(`http://easyform.jahanmal.xyz/v1${path}`).href)
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
  // uxBirthDate_Shamsi:"1380/01/01",
  uxBirthDate:`199${generateRandomString(1, "num")}-${(Number.parseInt(generateRandomString(1, "num"))) + 1}-${Number.parseInt(generateRandomString(1, "num")) + 1}`,
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
    setTimeout(() => {
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
    }, 1200);

  })
}

// ////////////////////////////////////////////////////////////////////////


const counteInput = document.getElementById("counte")
const uxBirthLocationID = document.getElementById("uxBirthLocationID")
const uxResidenceCountryID = document.getElementById("uxResidenceCountryID")
const axLocationID = document.getElementById("axLocationID")
const submit = document.getElementById("submit")
const clipboardBtn = document.getElementById("clipboard")
const validate = document.getElementById("validate")
const form2 = document.getElementById("form2");
const uxName = document.getElementById("uxName");
const uxFatherName = document.getElementById("uxFatherName");
const uxGrandFatherName = document.getElementById("uxGrandFatherName");
const uxBirthDate = document.getElementById("uxBirthDate");
const uxSearch = document.getElementById("uxSearch");
const __VIEWSTATE = document.getElementById("__VIEWSTATE");
const __EVENTVALIDATION = document.getElementById("__EVENTVALIDATION");
const tbody = document.querySelector("table tbody");
const nameInput = document.getElementById("uxName");
const loadData = document.getElementById("loadData");

function submitHandler(name, fatherName, grandFather, date) {
  uxName.value = name;
  uxFatherName.value = fatherName;
  uxGrandFatherName.value = grandFather;
  uxBirthDate.value = date;
  uxSearch.click()
}
async function changeHandler(name, fatherName, grandFather, date, uxSerial, type = 'search', directReq = false) {
  try {
    if(!directReq)
      if(!confirm("Are U Sure To Change The province"))
        return
    const response = await fetch(serverPath(`/easyform/${type}`),
    {
      method: "POST",
      headers:
      {
        "Content-Type": "Application/json",
        "Authorization": `bearer ${token}`,
      },
      body: JSON.stringify({
        __VIEWSTATEGENERATOR: "59A49A67",
        __SCROLLPOSITIONX: "0",
        __SCROLLPOSITIONY: "500",
        __EVENTARGUMENT: "",
        __EVENTTARGET: "",
        __EVENTVALIDATION: __EVENTVALIDATION.value,
        __VIEWSTATE: __VIEWSTATE.value,
        uxName: name,
        uxFatherName: fatherName,
        uxGrandFatherName: grandFather,
        uxBirthDate: date,
        uxSearch: "جستجو",
        axLocationID: axLocationID.value,
        uxSerial: uxSerial,
      })
      
    });
    if(response.status === 500)
      alert("Info! " + "The changes is taking too long to submit. server will manage this.");
    const objData = await response.json()
    console.log(objData)
    if(objData.status === "failure")
      alert((objData.message || "Please Try Again !"));
    if(objData.status === "success" && type == 'search')
    {
      alert((objData.message || "Successfully Changed !"));
    }
    if(objData.status === "success" && type != 'search')
      {
        let findExist = newBackup.findIndex(perAp => perAp?.barCode == objData?.data?.barCode)
        if(findExist < 0)
          newBackup.push(objData.data);
        console.log(newBackup.length);
        await onbackup(newBackup)
      }
  } catch (error) {
    alert(error.message);
  }
}

let allData = [];

const submitListener = async(e) => {

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
}

const onclipboard = async(e) => {
  allDataForInfo.forEach((per) => {
    changeHandler(per.uxGivenNamesLocal, per.uxFatherNameLocal, per.uxGrandFatherNameLocal, per.uxBirthDate_Shamsi, per.uxSerial, 'openbarcode', true)
    .then(res => console.log(res))
    .catch(err => console.log(err))
  })

}

submit.addEventListener('click', submitListener)
clipboardBtn.addEventListener('click', onclipboard)

validate.addEventListener("click", loadKeys)
async function loadKeys(e) {
  let isConfirmed = confirm("Do you want submit apps too!");
  try {
    const response = await fetch('https://passport.moi.gov.af/search/default.aspx');
    const text = await response.text();
    const HTML_ELM = createELM("html");
    HTML_ELM.insertAdjacentHTML("afterbegin", text);
    const newViewState = HTML_ELM?.querySelector("#__VIEWSTATE");
    const newEventValidation = HTML_ELM?.querySelector("#__EVENTVALIDATION");
    

    if(!newViewState?.value || !newEventValidation?.value)
      return alert("تېروتنه. د فورمی باوری کولو تڼی بیا کښیکاږی");

    __VIEWSTATE.value = newViewState.value;
    __EVENTVALIDATION.value = newEventValidation.value;
    alert("په بریالیتوب سره باوری شوه");
    const passport = {
      __VIEWSTATE: newViewState.value,
      __EVENTVALIDATION: newEventValidation.value
    };
    window.localStorage.setItem("passport", JSON.stringify(passport));
    if(isConfirmed)
      await submitListener()
  } catch (error) {
    alert("تېروتنه بیاکوښښ وکی " + error.message);
  }
}



loadData.addEventListener("click", async(e) => {
  try {
    
    const response = await fetch(`http://localhost:8080/v1/easyform/fulldata?uxResidenceCountryID=${axLocationID.value.trim()}`, {
    // const response = await fetch(serverPath(`/easyform/fulldata?uxResidenceCountryID=${axLocationID.value.trim()}`), {
    // const response = await fetch(serverPath(`/easyform/fulldata?province=${axLocationID.value.trim()}`), {
      method: 'GET',
      headers:
      {
        "Content-Type": "Application/json",
        "Authorization": `bearer ${token}`,
        
      }});
    const objData = await response.json();
    if(objData.status === 'success')
    {
      loadDataToTable(objData.data, tbody)
      allDataForInfo = objData.data ? objData.data : [];
      alert("Successfully Loaded")
    }
  } catch (error) {
   console.log(error) 
   alert(error.message)
  }

})


function loadDataToTable(data, tbody) {
  backupData = [];
  tbody.innerHTML = "";
  data.forEach((applicant, index) => {
    let Province = afghanistanProvinces.find(per => per.id == applicant.axLocationID)?.province;
    backupData.push(`${Province},${applicant.uxCode},${applicant.uxBirthDate_Shamsi},0,${applicant.uxGivenNamesLocal}`)
    // backupData.push(`${Province},${applicant.uxCode},${applicant.uxBirthDate_Shamsi}`)
    tbody.insertAdjacentHTML("beforeend", 
        '<tr>' +

          '<td class="app-name">' + applicant.uxGivenNamesLocal + '</td>' +
          '<td class="app-name">' + applicant.uxFatherNameLocal + '</td>' +
          '<td class="app-name">' + applicant.uxGrandFatherNameLocal + '</td>' +
          '<td class="app-name">' + applicant.uxBirthDate_Shamsi + '</td>' +
          '<td class="app-name">' + applicant.uxCode + '</td>' +
          '<td class="app-name">' + Province + '</td>' +
          '<td class="action">' +
            '<div class="btn-group">' +
            '<button class="Submit" onclick="changeHandler(\'' + applicant.uxGivenNamesLocal + '\', \'' + applicant.uxFatherNameLocal + '\', \'' + applicant.uxGrandFatherNameLocal + '\', \'' + applicant.uxBirthDate_Shamsi + '\', \'' + applicant.uxSerial + '\', \'' + 'openbarcode' + '\')" tabindex=\'' + (index + 30000) + '\'>Get Data</button>' +
              '<button class="Submit" onclick="changeHandler(\'' + applicant.uxGivenNamesLocal + '\', \'' + applicant.uxFatherNameLocal + '\', \'' + applicant.uxGrandFatherNameLocal + '\', \'' + applicant.uxBirthDate_Shamsi + '\', \'' + applicant.uxSerial + '\')" tabindex=\'' + (index + 1) + '\'>Change</button>' +
              '<button class="Submit" onclick="submitHandler(\'' + applicant.uxGivenNamesLocal + '\', \'' + applicant.uxFatherNameLocal + '\', \'' + applicant.uxGrandFatherNameLocal + '\', \'' + applicant.uxBirthDate_Shamsi + '\')">Open</button>' +
            '</div>' +
          '</td>' +
          '<td class="number">' + 
            '<label>' + (index + 1) + 
              '<input type="checkbox">' + 
            '</label>' +
          '</td>' +
        '</tr>'
    );
});
}


async function onbackup(data) {
  let newData = data
  if (!data) newData = backupData;
  const textarea = document.createElement('textarea');
  let createBackupData = data ? newData.map(perApp =>
      `${perApp.barCode},${perApp.date},${perApp.name}`
  ) : backupData ;
  textarea.value = createBackupData.join("\n");
  textarea.style.height = "0";
  textarea.style.overflow = "hidden";
  document.body.focus();
  document.body.appendChild(textarea);
  textarea.select();
  try {
    // alert('Backup data copied to clipboard successfully!');
      await navigator.clipboard.writeText(textarea.value);
  } catch (err) {
      alert('Failed to copy backup data: ' + err);
  } finally {
      document.body.removeChild(textarea);
  }
}


document.onreadystatechange = (e) => {
  if(document.readyState === "complete")
  {
    try {
      let getKEYS = window.localStorage.getItem("passport");
      if(getKEYS)
      {
        getKEYS = JSON.parse(getKEYS);
        __VIEWSTATE.value = getKEYS.__VIEWSTATE
        __EVENTVALIDATION.value = getKEYS.__EVENTVALIDATION
      }
    } catch (error) {
      console.log(error.message)
    }
  }
}
