let backupData = [];
let allDataForInfo = [];
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
  { province: "Dar", id: 1384 },
  { province: "Tar", id: 1385 },
  { province: "Zam", id: 1386 },
];
function createELM(tagName) {
  return document.createElement(tagName);
}

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



const initFieldsState = () => ({
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
  uxBirthLocationID: "31",
  uxResidenceCountryID: "31",
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
  axFullAddress: "ادرس",
  axPrimaryMobile: '00000000',
  axLocationID: "31",
  ucaDurationTypeID: "1",
  ucaPaymentTypeID: "1",
});


const counteInput = document.getElementById("counte")
const uxBirthLocationID = document.getElementById("uxBirthLocationID")
const uxResidenceCountryID = document.getElementById("uxResidenceCountryID")
const axLocationID = document.getElementById("axLocationID")
const submit = document.getElementById("submit")
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

function submitHandler(name, fatherName, grandFather, date) {
  uxName.value = name;
  uxFatherName.value = fatherName;
  uxGrandFatherName.value = grandFather;
  uxBirthDate.value = date;
  uxSearch.click()
}
let allData = [];

const submitListener = async(e) => {


  e.preventDefault();


  const formData = new FormData(form2);

  
  const entries = formData.entries();
  const data = {};

  for (let [key, value] of entries) {
      data[key] = value;
  }


    let appData = {
      ...initFieldsState(), 
      ...data
    }
    appData.uxNID = JSON.stringify({S: appData.uxSerial, J: appData.uxJuld, P: appData.uxPage, N:appData.uxNo})
    appData.uxGenderID = appData.uxTitleID
    
    createOne(appData);
    window.location.reload()
}

form2.addEventListener('submit', submitListener)

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


function loadDataToTable(data, tbody) {
  backupData = [];
  tbody.innerHTML = "";
  data.forEach((applicant, index) => {
    let Province = afghanistanProvinces.find(per => per.id == applicant.axLocationID)?.province;
    backupData.push(`${Province},${applicant.uxSearch},${applicant.uxBirthDate_Shamsi},0,${applicant.uxGivenNamesLocal}`)
    // backupData.push(`${Province},${applicant.uxSearch},${applicant.uxBirthDate_Shamsi}`)
    tbody.insertAdjacentHTML("beforeend", 
        '<tr>' +
          '<td class="number">' + 
          '<label>' + (index + 1) + 
            '<input type="checkbox">' + 
          '</label>' +
          '</td>' +
          '<td class="app-name">' + applicant.uxGivenNamesLocal + '</td>' +
          '<td class="app-name">' + applicant.uxFatherNameLocal + '</td>' +
          '<td class="app-name">' + applicant.uxGrandFatherNameLocal + '</td>' +
          '<td class="app-name">' + applicant.uxBirthDate_Shamsi + '</td>' +
          '<td class="app-name">' + applicant.uxSerial + '</td>' +
          '<td class="app-name">' + Province + '</td>' +
          '<td class="action">' +
            '<div class="btn-group">' +
              '<button class="Submit" onclick="showHandlwe(\'' + applicant.uxSerial + '\')" tabindex=\'' + (index + 1) + '\'>Show</button>' +
              '<button class="Submit" style="color: red" onclick="deleteHandler(\'' + applicant.uxSerial + '\')">Delete</button>' +
            '</div>' +
          '</td>' +
        '</tr>'
    );
});
}


async function onbackup(data) {
  let newData = data
  if (!data) newData = database;
  const textarea = document.createElement('textarea');

  textarea.value = (JSON.stringify(newData).replace(/\}\,\{/ig, '},\n{'))
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

function showHandlwe (uxSerial)
{
  let showData = fineOne(uxSerial)

  let showText = `
  PS Family Name : ${showData.uxFamilyNameLocal}
  EN FamilyName : ${showData.uxFamilyName}
  ----------------------------------------------
  PS Name : ${showData.uxGivenNamesLocal}
  EN Name : ${showData.uxGivenNames}
  ----------------------------------------------
  PS Father Name : ${showData.uxFatherNameLocal}
  EN Father Name : ${showData.uxFatherName}
  ----------------------------------------------
  PS GrandFather Name : ${showData.uxGrandFatherNameLocal}
  EN GrandFather Name : ${showData.uxGrandFatherName}
  ----------------------------------------------
  Birth Date : ${showData.uxBirthDate}
  Shamsi Birth Date : ${showData.uxBirthDate_Shamsi}
  ----------------------------------------------
  Birth Location : ${afghanistanProvinces.find(per => per.id == showData.uxBirthLocationID)?.province}
  Current Location : ${afghanistanProvinces.find(per => per.id == showData.uxResidenceCountryID)?.province}
  Passport Province : ${afghanistanProvinces.find(per => per.id == showData.axLocationID)?.province}
  ----------------------------------------------
  Tazkira ID : ${showData.uxSerial}
  Juld : ${showData.uxJuld}
  Page : ${showData.uxPage}
  `; 
  

  alert(showText);
}
function deleteHandler (uxSerial)
{
  let a = confirm("Are You Sure To Delete This Application")
  if(a)
    {
      deleteOne(uxSerial);
      window.location.reload()
    }
}

document.onreadystatechange = (e) => {
  if(document.readyState === "complete")
  {
    try {
        loadDataToTable(database, tbody)
    } catch (error) {
      console.log(error.message)
    }
  }
}
