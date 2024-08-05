// const axios  = require('axios');
const express = require('express');
const router = express.Router();
// const https = require("https")
const cheerio = require('cheerio');
const request  = require('request');
const SubmittedApp = require('../app/model/SubmittedApp');
const { createApplication, getFullData, testApplication, openBarCode } = require('../app/controllers/createApplication');
const NewForm = require('../app/model/NewForm');
const queryString = require("querystring");



router.post('/barcode', async (req, res) => {

    let reqData = req.body;
    console.log(reqData)
	let random = ((Math.random() * 1500) + "").replace(".", '').slice(0, 3)
    let { userId } = req.auth;
    let name = reqData.name;
    delete reqData.name;
    reqData = { ...reqData };
    let axLocationID = reqData.axLocationID || '31';
    const encodedForm = queryString.stringify({
        "__VIEWSTATEGENERATOR": reqData.__VIEWSTATEGENERATOR || "768A9483",
        "__EVENTVALIDATION": reqData.__EVENTVALIDATION,
        "__SCROLLPOSITIONX": reqData.__SCROLLPOSITIONX,
        "__SCROLLPOSITIONY": reqData.__SCROLLPOSITIONY,
        "__EVENTARGUMENT":"",
        "__EVENTTARGET":"",
        "__VIEWSTATE": reqData.__VIEWSTATE,
        "uxBirthDate": reqData.uxBirthDate,
        "uxSearch": 'جستجو',
        "uxCode": reqData.uxCode,
    })
    const bypassHeaders = { 
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7', 
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9,fa-IR;q=0.8,fa;q=0.7',
        'Cache-Control': 'max-age=0',
        'Origin': 'https://passport.moi.gov.af',
        'Priority': 'u=0, i',
		// 'Sec-Ch-Ua': `"Google Chrome";v="125", "Not:A-Brand";v="8", "Chromium";v="125"`, 
        'Sec-Ch-Ua': '"Not:A-Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
		// 'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36`,
        'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)',
    }

    const requestOptions = {
        url: 'https://passport.moi.gov.af/BarcodeSearch/',
        form: encodedForm,
        strictSSL: false,
        followRedirect: true,
        headers: bypassHeaders,
        gzip: true
    };
    let saveCookie = "";

    let isExist = await SubmittedApp.findOne({
        where: {
            uxBirthDate: reqData.uxBirthDate,
            uxCode: reqData.uxCode,
            axLocationID: axLocationID,
        }
    });
    if(isExist)
        return res.json({status: "success", data: isExist});
    let submittingObject = {
        Button2: "ثبت",
    }

    let datebyNumber = Number.parseInt(reqData?.uxBirthDate?.slice(0, 4));
    let fullInfo = {
        ucaFineTypeID: "1",
        ucaApplicationTypeID: "1",
        ucaDurationTypeID: "1",
        ucaPaymentTypeID: datebyNumber > 1388 ? "3" : "1" ,
        ucaCreatedBy: "1",
        ucaStatusID: "2",
        ucaServiceID: "14",
        PayablePrice: datebyNumber > 1388 ? "3250" : "5500",
        uxCurrentTab: "dvApplication",
        ucaTypeID: "1",
        _AppTypeID: '2',
    }

    let submitFullinfo = true;

    const handleRequest = (options, retryCount = 0) => {
        request.post(options, function(error, response, body) {
            if (!error) {
                if (response.statusCode === 200) {
                    const $ = cheerio.load(body);
                    let ucaTypeID = $("#ucaTypeID").val();
                    let isBarCodeCorrect = $('#uxMessage[style]')
                    if (isBarCodeCorrect.length)
                        return res.json({ status: "failure", message: "Your Barcode or date is incorrect" });
                    if( response.headers?.location?.search(/^\/{1}$/) == 0)
                        return res.json({status: "failure", message: "The Site Has Problem "})
                    console.log(ucaTypeID, "UCA HAS2")
                    if(ucaTypeID == 0 && submitFullinfo)
                        {
                            console.log(ucaTypeID, "CHANGING UCA")
                            delete submittingObject.Button2
                            submittingObject = {...submittingObject,...fullInfo}
                            submittingObject.appSave = "ثبت"
                            return handleRequest({...options, form: {...options.form, ...submittingObject}}, 0)
                        }
                    SubmittedApp.findOrCreate({
                    // SubmittedApp.findOne({
                        where:{
                            uxBirthDate: reqData.uxBirthDate,
                            uxCode: reqData.uxCode,
                            axLocationID: axLocationID,
                        },
                        defaults: {
                            uxBirthDate: reqData.uxBirthDate,
                            uxCode: reqData.uxCode,
                            axLocationID: axLocationID,
                            name: name,
                            tokenId: userId?.tokenId || null,
                        }
                    })
                    .then(res => res)
                    .catch(err => console.log(err))
                    .finally(() => {
                        const option = $("#axLocationID option")
                        let activeProvinces = []
                        option.each((index, element) => {
    
                            const value = $(element).attr('value');
                            if(value == 0)
                                return
                            const innerHTML = $(element).html();
                            activeProvinces.push({
                                value,
                                name: innerHTML
                            })
                        });
                        res.json({ status: "success", activeProvinces});
                    })
                } else if (response.statusCode === 301 || response.statusCode === 302) {

                    let createURL = ("https://passport.moi.gov.af" + response.headers.location);
                    saveCookie = (response?.headers['set-cookie'] + "")?.replace("; path=/; HttpOnly", "");
                    if(createURL?.toLowerCase()?.search("/print") >= 0)
                        return res.json({status: "success", message: "The Process Is Already Completed!"});

                    if(createURL.search("Error/Maintenance") >= 0)
                        {
                            console.log(body)
                            return res.json({status: "failure", message: "Please Validate Your Application!"});
                        }

                    if(response.headers?.location?.search('Maintenance') >= 0 || response.headers?.location?.search(/^\/{1}$/) == 0)
                        return res.json({status: "failure", message: "Maybe the province is not active or other problem beside validate your application"})
                    
                    console.log("BARCODE REDIRECTING TO", response.headers.location);
                    handleRedirect({
                        url: "https://passport.moi.gov.af" + response.headers.location,
                        strictSSL: false,
                        headers: {
                            ...bypassHeaders,
                            'Referer': 'https://passport.moi.gov.af/BarcodeSearch/',
                            'Cookie': saveCookie,
                        },
                        gzip: true
                    });
                } else if (response.statusCode === 503 && retryCount < 5) { // Retry only a certain number of times
                    // Resubmit the form
                    console.log(options, "REQUESTING")
                    handleRequest(options, retryCount + 1);
                } else {
                    console.error('Error:', response.statusCode);
                    const $ = cheerio.load(body);
                    if (body.search("Invalid postback or callback argument") >= 0)
                        return res.json({ status: "failure", message: "Entered Invalid Province!" });

                    let isFormValid = $('body[bgcolor="white"]')
                    if (isFormValid.length)
                        return res.json({ status: "failure", message: "Please Validate Your Form!" });

                    res.json({ status: "failure", message: "Please Try Again 1" })
                }
            } else {
                console.error('Error:2', error);
                res.json({ status: "failure", message: "Please Try Again 2" })
            }
        });
    };

    // Function to handle the redirection request
    const handleRedirect = (options, retryCount = 0) => {
        request.get(options, async function(error, response, body) {
            if (!error) {
                if (response.statusCode === 200) {
                    const $ = cheerio.load(body);
                    let __VIEWSTATE = $("#__VIEWSTATE").val();
                    let ucaTypeID = $("#ucaTypeID").val();
                    let __EVENTVALIDATION = $("#__EVENTVALIDATION").val();
                    let axPrimaryMobile = $("#axPrimaryMobile").val();
                    let axFullAddress = $("#axFullAddress").val();
                    let axHouseNo = $("#axHouseNo").val();
                    let apo = $("#apo").val();
                    if(apo || apo?.length > 0)
                        return res.json({ status: "failure", message: "Please check the barcode from your browser" })

                    console.log("BARCODE IS SUBMITTING");
                    const option = $("#axLocationID option")
                    let newProvinces = false;
                    let isSelected = false;
                    let activeProvinces = []
                    option.each((index, element) => {

                        const value = $(element).attr('value');
                        if(value == 0)
                            return
                        const innerHTML = $(element).html();
                        activeProvinces.push({
                            value,
                            name: innerHTML
                        })
                    });
                    option.each((index, element) => {

                        const value = $(element).attr('value');
                        const selected = $(element).attr("selected")
                        if( selected == 'selected' && value == axLocationID  )
                                isSelected = true;
                        if( value == axLocationID )
                                newProvinces = true;
                    });

                    if(isSelected)
                        {
                            console.log("ALREADY CHANGED")
                            let DBSavedForm = await SubmittedApp.findOrCreate({
                                where:{
                                    uxBirthDate: reqData.uxBirthDate,
                                    uxCode: reqData.uxCode,
                                    axLocationID: axLocationID,
                                },
                                defaults: {
                                    uxBirthDate: reqData.uxBirthDate,
                                    uxCode: reqData.uxCode,
                                    axLocationID: axLocationID,
                                    name: name,
                                    tokenId: userId?.tokenId || null,
                                }
                            })
                            console.log(ucaTypeID, "UCA HAS1")
                            if(ucaTypeID != 0 || !submitFullinfo)
                                return res.json({status: "success", data: Array.isArray(DBSavedForm) ? DBSavedForm[0] : DBSavedForm, activeProvinces})
                            delete submittingObject.Button2
                            submittingObject = {...submittingObject,...fullInfo}
                            submittingObject.appSave = "ثبت"
                        }
                    if(!newProvinces)
                        return res.json({status: "failure", message: "This Province is not active for change", activeProvinces})
                    let __EVENTTARGET = $("#__EVENTTARGET").val();
                    let __EVENTARGUMENT = $("#__EVENTARGUMENT").val();
                    let __LASTFOCUS = $("#__LASTFOCUS").val();
                    let __VIEWSTATEGENERATOR = $("#__VIEWSTATEGENERATOR").val();
                    let __SCROLLPOSITIONX = $("#__SCROLLPOSITIONX").val();
                    let __SCROLLPOSITIONY = $("#__SCROLLPOSITIONY").val();
                    let AddressStep = $("#AddressStep").val();
                    let CompanyStep = $("#CompanyStep").val();
                    let EducationStep = $("#EducationStep").val();
                    let JobStep = $("#JobStep").val();
                    let PreviousPassportStep = $("#PreviousPassportStep").val();
                    let CriminalRecordStep = $("#CriminalRecordStep").val();
                    let ApplicationStep = $("#ApplicationStep").val();
                    let uxTitleID = $("#uxTitleID").val();
                    let uxCriminalRecord = $("#uxCriminalRecord").val();
                    let _AppTypeID = $("#_AppTypeID").val();
                    let uxFamilyNameLocal = $("#uxFamilyNameLocal").val();
                    let uxFamilyName = $("#uxFamilyName").val();
                    let uxGivenNamesLocal = $("#uxGivenNamesLocal").val();
                    let uxGivenNames = $("#uxGivenNames").val();
                    let uxFatherNameLocal = $("#uxFatherNameLocal").val();
                    let uxFatherName = $("#uxFatherName").val();
                    let uxGrandFatherNameLocal = $("#uxGrandFatherNameLocal").val();
                    let uxGrandFatherName = $("#uxGrandFatherName").val();
                    let uxBirthDate_Shamsi = $("#uxBirthDate_Shamsi").val();
                    let uxBirthDate = $("#uxBirthDate").val();
                    let uxProfessionID = $("#uxProfessionID").val();
                    let _Profession = $("#_Profession").val();
                    let uxBirthLocationID = $("#uxBirthLocationID").val();
                    let uxResidenceCountryID = $("#uxResidenceCountryID").val();
                    let uxMaritalStatusID = $("#uxMaritalStatusID").val();
                    let uxNIDTypeID = $("#uxNIDTypeID").val();
                    let uxSerial = $("#uxSerial").val();
                    let uxJuld = $("#uxJuld").val();
                    let uxPage = $("#uxPage").val();
                    let uxNo = $("#uxNo").val();
                    let uxNID = $("#uxNID").val();
                    let uxGenderID = $("#uxGenderID").val();
                    let uxHairColorID = $("#uxHairColorID").val();
                    let uxEyeColorID = $("#uxEyeColorID").val();
                    let uxBodyHeightCM = $("#uxBodyHeightCM").val();
                    let uxCreatedBy = $("#uxCreatedBy").val();
                    let uxWorkItemID = $("#uxWorkItemID").val();
                    let BDC_VCID_c_proceedapplication_default_bdcaptcha = $("#BDC_VCID_c_proceedapplication_default_bdcaptcha").val();
                    let BDC_BackWorkaround_c_proceedapplication_default_bdcaptcha = $("#BDC_BackWorkaround_c_proceedapplication_default_bdcaptcha").val();
                    let BDC_Hs_c_proceedapplication_default_bdcaptcha = $("#BDC_Hs_c_proceedapplication_default_bdcaptcha").val();
                    let BDC_SP_c_proceedapplication_default_bdcaptcha = $("#BDC_SP_c_proceedapplication_default_bdcaptcha").val();
                    let txtCaptchaCode = $("#txtCaptchaCode").val();
                    let uxPhotoData = $("#uxPhotoData").val();
                    let uxPhotoFileName = $("#uxPhotoFileName").val();
                    let uxSignatureData = $("#uxSignatureData").val();
                    let uxSignatureFileName = $("#uxSignatureFileName").val();
                    let axPostOfficeID = $("#axPostOfficeID").val();
                    let axStreetNo = $("#axStreetNo").val();
                    let axTypeOfAddressID = $("#axTypeOfAddressID").val();
                    let ucmBusinessName = $("#ucmBusinessName").val();
                    let ucmStatusID = $("#ucmStatusID").val();
                    let ucmLocationID = $("#ucmLocationID").val();
                    let ucmBusinessLicenseNo = $("#ucmBusinessLicenseNo").val();
                    let ucmTINNumber = $("#ucmTINNumber").val();
                    let ucmTypeOfBusinessID = $("#ucmTypeOfBusinessID").val();
                    let ucmFullAddress = $("#ucmFullAddress").val();
                    let ucmIssueDate = $("#ucmIssueDate").val();
                    let ucmExpairDate = $("#ucmExpairDate").val();
                    let uedEducationLevelID = $("#uedEducationLevelID").val();
                    let uedInstituteTypeID = $("#uedInstituteTypeID").val();
                    let uedLocationID = $("#uedLocationID").val();
                    let uedDari = $("#uedDari").val();
                    let uedName = $("#uedName").val();
                    let uedStartYear = $("#uedStartYear").val();
                    let uedEndYear = $("#uedEndYear").val();
                    let ujbTypeOfExperienceID = $("#ujbTypeOfExperienceID").val();
                    let ujbLocationID = $("#ujbLocationID").val();
                    let ujbPositionLocal = $("#ujbPositionLocal").val();
                    let ujbPosition = $("#ujbPosition").val();
                    let ujbOrganizationNameLocal = $("#ujbOrganizationNameLocal").val();
                    let ujbOrganizationName = $("#ujbOrganizationName").val();
                    let ujbStartDate = $("#ujbStartDate").val();
                    let ujbEndDate = $("#ujbEndDate").val();
                    let uppPassportTypeID = $("#uppPassportTypeID").val();
                    let uppPassportNumber = $("#uppPassportNumber").val();
                    let uppIssueDate = $("#uppIssueDate").val();
                    let uppExpiryDate = $("#uppExpiryDate").val();
                    let ucrTypeOfCrimeID = $("#ucrTypeOfCrimeID").val();
                    let ucrDate = $("#ucrDate").val();
                    let ucrLocationID = $("#ucrLocationID").val();
                    let ucrArrested = $("#ucrArrested").val();
                    let ucrStatusID = $("#ucrStatusID").val();
                    let ucrReferenceNo = $("#ucrReferenceNo").val();
                    let ucrAdderss = $("#ucrAdderss").val();
                    let ucrDetails = $("#ucrDetails").val();
                    let uxOptions = $("#uxOptions").val();
                    let ucaFineTypeID = $("#ucaFineTypeID").val();
                    let ucaDurationTypeID = $("#ucaDurationTypeID").val();
                    let ucaApplicationTypeID = $("#ucaApplicationTypeID").val();
                    let ucaPaymentTypeID = $("#ucaPaymentTypeID").val();
                    let PayablePrice = $("#PayablePrice").val();
                    let ucaServiceID = $("#ucaServiceID").val();
                    let ucaStatusID = $("#ucaStatusID").val();
                    let ucaCreatedBy = $("#ucaCreatedBy").val();
                    let ucaName = $("#ucaName").val();
                    let ucaReferenceNo = $("#ucaReferenceNo").val();
                    console.log("UPDATES IS IN PROGRESS ", reqData.uxCode)
                    
                    handleRequest({
                        url: 'https://passport.moi.gov.af/proceedApplication/', 
                        form: {
                            __VIEWSTATE,
                            __EVENTVALIDATION,
                            axLocationID: axLocationID,
                            axPrimaryMobile: (axPrimaryMobile?.trim()?.length > 0) ? (axPrimaryMobile+" ") : `0000000000`,
                            axFullAddress: (axFullAddress?.trim()?.length > 0) ? (axFullAddress+" ") : "ادرس",
                            axHouseNo: (axHouseNo?.trim()?.length > 0) ? (axHouseNo+" ") : "     ",
                            uxCurrentTab: 'dvAddress',
                            DocumentsStep: true,
                            __EVENTTARGET: __EVENTTARGET,
                            __EVENTARGUMENT: __EVENTARGUMENT,
                            __LASTFOCUS: __LASTFOCUS,
                            __VIEWSTATEGENERATOR: __VIEWSTATEGENERATOR,
                            __SCROLLPOSITIONX: __SCROLLPOSITIONX,
                            __SCROLLPOSITIONY: __SCROLLPOSITIONY,
                            AddressStep: AddressStep,
                            CompanyStep: CompanyStep,
                            EducationStep: EducationStep,
                            JobStep: JobStep,
                            PreviousPassportStep: PreviousPassportStep,
                            CriminalRecordStep: CriminalRecordStep,
                            ApplicationStep: ApplicationStep,
                            uxTitleID: uxTitleID,
                            uxCriminalRecord: uxCriminalRecord,
                            _AppTypeID: _AppTypeID,
                            uxFamilyNameLocal: uxFamilyNameLocal,
                            uxFamilyName: uxFamilyName,
                            uxGivenNamesLocal: uxGivenNamesLocal,
                            uxGivenNames: uxGivenNames,
                            uxFatherNameLocal: uxFatherNameLocal,
                            uxFatherName: uxFatherName,
                            uxGrandFatherNameLocal: uxGrandFatherNameLocal,
                            uxGrandFatherName: uxGrandFatherName,
                            uxBirthDate_Shamsi: uxBirthDate_Shamsi,
                            uxBirthDate: uxBirthDate,
                            uxProfessionID: uxProfessionID,
                            _Profession: _Profession,
                            uxBirthLocationID: uxBirthLocationID,
                            uxResidenceCountryID: uxResidenceCountryID,
                            uxMaritalStatusID: uxMaritalStatusID,
                            uxNIDTypeID: uxNIDTypeID,
                            uxSerial: uxSerial,
                            uxJuld: uxJuld,
                            uxPage: uxPage,
                            uxNo: uxNo,
                            uxNID: uxNID,
                            uxGenderID: uxGenderID,
                            uxHairColorID: uxHairColorID,
                            uxEyeColorID: uxEyeColorID,
                            uxBodyHeightCM: uxBodyHeightCM,
                            uxCreatedBy: uxCreatedBy,
                            uxWorkItemID: uxWorkItemID,
                            BDC_VCID_c_proceedapplication_default_bdcaptcha: BDC_VCID_c_proceedapplication_default_bdcaptcha,
                            BDC_BackWorkaround_c_proceedapplication_default_bdcaptcha: BDC_BackWorkaround_c_proceedapplication_default_bdcaptcha,
                            BDC_Hs_c_proceedapplication_default_bdcaptcha: BDC_Hs_c_proceedapplication_default_bdcaptcha,
                            BDC_SP_c_proceedapplication_default_bdcaptcha: BDC_SP_c_proceedapplication_default_bdcaptcha,
                            txtCaptchaCode: txtCaptchaCode,
                            uxPhotoData: uxPhotoData,
                            uxPhotoFileName: uxPhotoFileName,
                            uxSignatureData: uxSignatureData,
                            uxSignatureFileName: uxSignatureFileName,
                            axPostOfficeID: axPostOfficeID,
                            axStreetNo: axStreetNo,
                            axTypeOfAddressID: axTypeOfAddressID,
                            ucmBusinessName: ucmBusinessName,
                            ucmStatusID: ucmStatusID,
                            ucmLocationID: ucmLocationID,
                            ucmBusinessLicenseNo: ucmBusinessLicenseNo,
                            ucmTINNumber: ucmTINNumber,
                            ucmTypeOfBusinessID: ucmTypeOfBusinessID,
                            ucmFullAddress: ucmFullAddress,
                            ucmIssueDate: ucmIssueDate,
                            ucmExpairDate: ucmExpairDate,
                            uedEducationLevelID: uedEducationLevelID,
                            uedInstituteTypeID: uedInstituteTypeID,
                            uedLocationID: uedLocationID,
                            uedDari: uedDari,
                            uedName: uedName,
                            uedStartYear: uedStartYear,
                            uedEndYear: uedEndYear,
                            ujbTypeOfExperienceID: ujbTypeOfExperienceID,
                            ujbLocationID: ujbLocationID,
                            ujbPositionLocal: ujbPositionLocal,
                            ujbPosition: ujbPosition,
                            ujbOrganizationNameLocal: ujbOrganizationNameLocal,
                            ujbOrganizationName: ujbOrganizationName,
                            ujbStartDate: ujbStartDate,
                            ujbEndDate: ujbEndDate,
                            uppPassportTypeID: uppPassportTypeID,
                            uppPassportNumber: uppPassportNumber,
                            uppIssueDate: uppIssueDate,
                            uppExpiryDate: uppExpiryDate,
                            ucrTypeOfCrimeID: ucrTypeOfCrimeID,
                            ucrDate: ucrDate,
                            ucrLocationID: ucrLocationID,
                            ucrArrested: ucrArrested,
                            ucrStatusID: ucrStatusID,
                            ucrReferenceNo: ucrReferenceNo,
                            ucrAdderss: ucrAdderss,
                            ucrDetails: ucrDetails,
                            ucaTypeID: ucaTypeID,
                            uxOptions: uxOptions,
                            ucaFineTypeID: ucaFineTypeID,
                            ucaDurationTypeID: ucaDurationTypeID,
                            ucaApplicationTypeID: ucaApplicationTypeID,
                            ucaPaymentTypeID: ucaPaymentTypeID,
                            PayablePrice: PayablePrice,
                            ucaServiceID: ucaServiceID,
                            ucaStatusID: ucaStatusID,
                            ucaCreatedBy: ucaCreatedBy,
                            ucaName: ucaName,
                            ucaReferenceNo: ucaReferenceNo,
                            ...submittingObject
                        },
                        strictSSL: false,
                        headers: {
                            ...bypassHeaders,
                            'Referer': 'https://passport.moi.gov.af/proceedApplication/',
                            'Cookie': saveCookie
                        },
                        gzip: true
                    });
                } else if (response.statusCode === 503 && retryCount < 5) { // If 503 Service Unavailable error occurs during redirection
                    // Resubmit the redirection request
                    console.log(options, "REDIRECTING")
                    handleRedirect(options, retryCount + 1);
                } else {
                    console.error('Error:', response.statusCode);
                    res.json({ status: "failure", message: "Please Try Again 3" })
                }
            } else {
                console.error('4Error:', error || response.statusCode);
                res.json({ status: "failure", message: "Please Try Again 4" })
            }
        });
    };

    // Start the request
    handleRequest(requestOptions);
});

router.post('/search', async (req, res) => {
    let reqData = req.body;
	let random = ((Math.random() * 1500) + "").replace(".", '').slice(0, 3)
    console.log(reqData)
    let uxCode = null;
    let uxSerial = reqData.uxSerial;
    delete reqData.uxSerial;
    let axLocationID = reqData.axLocationID || '31';
    const bypassHeaders = { 
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7', 
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9,fa-IR;q=0.8,fa;q=0.7',
        'Cache-Control': 'max-age=0',
        'Origin': 'https://passport.moi.gov.af',
        'Priority': 'u=0, i',
        'Referer': 'https://passport.moi.gov.af/search/default.aspx',
		// 'Sec-Ch-Ua': `"Google Chrome";v="125", "Not:A-Brand";v="8", "Chromium";v="125"`, 
        'Sec-Ch-Ua': '"Not:A-Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
		// 'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36`,
        'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)',
    }

    const requestOptions = {
        url: 'https://passport.moi.gov.af/search/default.aspx',
        form: {
            ...reqData,
            "uxSearch": 'جستجو',
        },
        strictSSL: false,
        followRedirect: false,
        headers: bypassHeaders,
        gzip: true,
    };
    let saveCookie = "";

    let isExist = await NewForm.findOne({
        where: {uxSerial: uxSerial}
    });
    if(!isExist)
        return res.json({status: "failure", message: "This Application is not registered at the system"});
    let jsonExist = isExist?.toJSON();
    if(jsonExist?.isChanged && jsonExist?.axLocationID == axLocationID)
        return res.json({status: "success", data: isExist});
    let submittingObject = {
        Button2: "ثبت",
    }
    let datebyNumber = Number.parseInt(reqData?.uxBirthDate?.slice(0, 4));
    let fullInfo = {
        ucaFineTypeID: "1",
        ucaApplicationTypeID: "1",
        ucaDurationTypeID: "1",
        ucaPaymentTypeID: "1",
        ucaPaymentTypeID: datebyNumber > 1388 ? "3" : "1" ,
        PayablePrice: datebyNumber > 1388 ? "3250" : "5500",
        ucaCreatedBy: "1",
        ucaStatusID: "2",
        ucaServiceID: "14",
        uxCurrentTab: "dvApplication",
        ucaTypeID: "1",
        _AppTypeID: '2',
    }

    let submitFullinfo = true;
    let completeRequest = 1;
    const handleRequest = (options, retryCount = 0) => {
        request.post(options, function(error, response, body) {
            if (!error) {
                if (response.statusCode === 200) {
                    saveCookie = (response?.headers['set-cookie'] + "")?.replace("; path=/; HttpOnly", "");

                    const $ = cheerio.load(body);
                    let ucaTypeID = $("#ucaTypeID").val();
                    let isBarCodeCorrect = $('#uxMessage[style]')
                    if (isBarCodeCorrect.length)
                    return res.json({ status: "failure", message: "Your Barcode or date is incorrect" });
                    if(completeRequest <= 1 && retryCount < 5)
                    {
                        const reqHeaders = {...requestOptions, headers: {...requestOptions.headers, 'Cookie': saveCookie}};
                        console.log(reqHeaders)
                        console.log("REREQUESTING", reqHeaders)
                            handleRequest(reqHeaders, (retryCount + 1));
                        return
                    }
                    if(uxCode === null && $('#uxCode')?.attr("value")?.length > 3)
                        uxCode = $('#uxCode')?.attr("value");
                    if(uxCode != null && uxCode?.length > 3)
                        isExist.uxCode = uxCode;

                    console.log(ucaTypeID, "UCA HAS2")
                    if(ucaTypeID == 0 && submitFullinfo)
                        {
                            console.log(ucaTypeID, "CHANGING UCA")
                            delete submittingObject.Button2
                            submittingObject = {...submittingObject,...fullInfo}
                            submittingObject.appSave = "ثبت"
                            return handleRequest({...options, form: {...options.form, ...submittingObject}}, 0)
                        }

                    isExist.isChanged = true;
                    isExist.axLocationID = axLocationID;
                    isExist.save()
                    .then(res => res)
                    .catch(err => console.log(err))
                    .finally(() => {
                        res.json({ status: "success" });
                    })
                        // res.json({ status: "success" });
                } else if (response.statusCode === 301 || response.statusCode === 302) {
                    console.log("REQUEST_HANDLER", response.statusCode, "https://passport.moi.gov.af" + response.headers.location)
                    let createURL = ("https://passport.moi.gov.af" + response.headers.location);
                    if((createURL?.toLowerCase())?.search("/print") >= 0 )
                        return res.json({status: "success", message: "The Process Is Already Completed!"});

                    if(createURL.search("Error/Maintenance") >= 0)
                        return res.json({status: "failure", message: "Please Validate Your Application!"})

                    if(response.headers?.location?.search('Maintenance') >= 0 || response.headers?.location?.search(/^\/{1}$/) == 0)
                        return res.json({status: "failure", message: "Maybe the province is not active or other problem beside validate your application"})

                    handleRedirect({
                        url: "https://passport.moi.gov.af" + response.headers.location,
                        strictSSL: false,
                        headers: {
                            'Cookie': saveCookie,
                            ...bypassHeaders,
                        },
                        gzip: true
                    });
                } else if (response.statusCode === 503 && retryCount < 5) { 
                    console.log(options, "REQUESTING")
                    handleRequest(options, retryCount + 1);
                } else {
                    console.error('Error:', response.statusCode);
                    const $ = cheerio.load(body);
                    if (body.search("Invalid postback or callback argument") >= 0)
                        return res.json({ status: "failure", message: "Entered Invalid Province!" });

                    let isFormValid = $('body[bgcolor="white"]')
                    if (isFormValid.length)
                        return res.json({ status: "failure", message: "Please Validate Your Application!" });


                    res.json({ status: "failure", message: "Please Try Again 1" })
                }
            } else {
                console.error('Error:', error);
                res.json({ status: "failure", message: "Please Try Again 2" })
            }
        });
    };

    // Function to handle the redirection request
    const handleRedirect = (options, retryCount = 0) => {
        request.get(options, async function(error, response, body) {
            completeRequest++;
            if (!error) {
                if (response.statusCode === 200) {
                    const $ = cheerio.load(body);
                    console.log("FIRST REDIRECTING")
                    let ucaTypeID = $("#ucaTypeID").val();
                    let __VIEWSTATE = $("#__VIEWSTATE").val();
                    let __EVENTVALIDATION = $("#__EVENTVALIDATION").val();
                    let axPrimaryMobile = $("#axPrimaryMobile").val();
                    let axFullAddress = $("#axFullAddress").val();
                    let axHouseNo = $("#axHouseNo").val();
                    const option = $("#axLocationID option")
                    const uxCode = $("#uxCode").val()
                    let newProvinces = false;
                    let isSelected = false;
                    if(uxCode)
                        isExist.uxCode = uxCode;
                    option.each((index, element) => {

                        const value = $(element).attr('value');
                        const selected = $(element).attr("selected")
                        if( selected == 'selected' && value == axLocationID  )
                                isSelected = true;
                        if( value == axLocationID )
                                newProvinces = true;
                    });
                    if(isSelected)
                        {
                            console.log("ALREADY CHANGED")
                            isExist.isChanged = true;
                            isExist.axLocationID = axLocationID;
                            await isExist.save()

                            delete submittingObject.Button2
                            console.log(ucaTypeID, "UCA HAS1")
                            if(ucaTypeID != 0 || !submitFullinfo)
                                return res.json({status: "success"})

                            submittingObject = {...submittingObject,...fullInfo}
                            submittingObject.appSave = "ثبت"
                        }
                        
                    if(!newProvinces)
                        return res.json({status: "failure", message: "This Province is not active for change"});

                    let __EVENTTARGET = $("#__EVENTTARGET").val();
                    let __EVENTARGUMENT = $("#__EVENTARGUMENT").val();
                    let __LASTFOCUS = $("#__LASTFOCUS").val();
                    let __VIEWSTATEGENERATOR = $("#__VIEWSTATEGENERATOR").val();
                    let __SCROLLPOSITIONX = $("#__SCROLLPOSITIONX").val();
                    let __SCROLLPOSITIONY = $("#__SCROLLPOSITIONY").val();
                    let AddressStep = $("#AddressStep").val();
                    let CompanyStep = $("#CompanyStep").val();
                    let EducationStep = $("#EducationStep").val();
                    let JobStep = $("#JobStep").val();
                    let PreviousPassportStep = $("#PreviousPassportStep").val();
                    let CriminalRecordStep = $("#CriminalRecordStep").val();
                    let ApplicationStep = $("#ApplicationStep").val();
                    let uxTitleID = $("#uxTitleID").val();
                    let uxCriminalRecord = $("#uxCriminalRecord").val();
                    let _AppTypeID = $("#_AppTypeID").val();
                    let uxFamilyNameLocal = $("#uxFamilyNameLocal").val();
                    let uxFamilyName = $("#uxFamilyName").val();
                    let uxGivenNamesLocal = $("#uxGivenNamesLocal").val();
                    let uxGivenNames = $("#uxGivenNames").val();
                    let uxFatherNameLocal = $("#uxFatherNameLocal").val();
                    let uxFatherName = $("#uxFatherName").val();
                    let uxGrandFatherNameLocal = $("#uxGrandFatherNameLocal").val();
                    let uxGrandFatherName = $("#uxGrandFatherName").val();
                    let uxBirthDate_Shamsi = $("#uxBirthDate_Shamsi").val();
                    let uxBirthDate = $("#uxBirthDate").val();
                    let uxProfessionID = $("#uxProfessionID").val();
                    let _Profession = $("#_Profession").val();
                    let uxBirthLocationID = $("#uxBirthLocationID").val();
                    let uxResidenceCountryID = $("#uxResidenceCountryID").val();
                    let uxMaritalStatusID = $("#uxMaritalStatusID").val();
                    let uxNIDTypeID = $("#uxNIDTypeID").val();
                    let uxSerial = $("#uxSerial").val();
                    let uxJuld = $("#uxJuld").val();
                    let uxPage = $("#uxPage").val();
                    let uxNo = $("#uxNo").val();
                    let uxNID = $("#uxNID").val();
                    let uxGenderID = $("#uxGenderID").val();
                    let uxHairColorID = $("#uxHairColorID").val();
                    let uxEyeColorID = $("#uxEyeColorID").val();
                    let uxBodyHeightCM = $("#uxBodyHeightCM").val();
                    let uxCreatedBy = $("#uxCreatedBy").val();
                    let uxWorkItemID = $("#uxWorkItemID").val();
                    let BDC_VCID_c_proceedapplication_default_bdcaptcha = $("#BDC_VCID_c_proceedapplication_default_bdcaptcha").val();
                    let BDC_BackWorkaround_c_proceedapplication_default_bdcaptcha = $("#BDC_BackWorkaround_c_proceedapplication_default_bdcaptcha").val();
                    let BDC_Hs_c_proceedapplication_default_bdcaptcha = $("#BDC_Hs_c_proceedapplication_default_bdcaptcha").val();
                    let BDC_SP_c_proceedapplication_default_bdcaptcha = $("#BDC_SP_c_proceedapplication_default_bdcaptcha").val();
                    let txtCaptchaCode = $("#txtCaptchaCode").val();
                    let uxPhotoData = $("#uxPhotoData").val();
                    let uxPhotoFileName = $("#uxPhotoFileName").val();
                    let uxSignatureData = $("#uxSignatureData").val();
                    let uxSignatureFileName = $("#uxSignatureFileName").val();
                    let axPostOfficeID = $("#axPostOfficeID").val();
                    let axStreetNo = $("#axStreetNo").val();
                    let axTypeOfAddressID = $("#axTypeOfAddressID").val();
                    let ucmBusinessName = $("#ucmBusinessName").val();
                    let ucmStatusID = $("#ucmStatusID").val();
                    let ucmLocationID = $("#ucmLocationID").val();
                    let ucmBusinessLicenseNo = $("#ucmBusinessLicenseNo").val();
                    let ucmTINNumber = $("#ucmTINNumber").val();
                    let ucmTypeOfBusinessID = $("#ucmTypeOfBusinessID").val();
                    let ucmFullAddress = $("#ucmFullAddress").val();
                    let ucmIssueDate = $("#ucmIssueDate").val();
                    let ucmExpairDate = $("#ucmExpairDate").val();
                    let uedEducationLevelID = $("#uedEducationLevelID").val();
                    let uedInstituteTypeID = $("#uedInstituteTypeID").val();
                    let uedLocationID = $("#uedLocationID").val();
                    let uedDari = $("#uedDari").val();
                    let uedName = $("#uedName").val();
                    let uedStartYear = $("#uedStartYear").val();
                    let uedEndYear = $("#uedEndYear").val();
                    let ujbTypeOfExperienceID = $("#ujbTypeOfExperienceID").val();
                    let ujbLocationID = $("#ujbLocationID").val();
                    let ujbPositionLocal = $("#ujbPositionLocal").val();
                    let ujbPosition = $("#ujbPosition").val();
                    let ujbOrganizationNameLocal = $("#ujbOrganizationNameLocal").val();
                    let ujbOrganizationName = $("#ujbOrganizationName").val();
                    let ujbStartDate = $("#ujbStartDate").val();
                    let ujbEndDate = $("#ujbEndDate").val();
                    let uppPassportTypeID = $("#uppPassportTypeID").val();
                    let uppPassportNumber = $("#uppPassportNumber").val();
                    let uppIssueDate = $("#uppIssueDate").val();
                    let uppExpiryDate = $("#uppExpiryDate").val();
                    let ucrTypeOfCrimeID = $("#ucrTypeOfCrimeID").val();
                    let ucrDate = $("#ucrDate").val();
                    let ucrLocationID = $("#ucrLocationID").val();
                    let ucrArrested = $("#ucrArrested").val();
                    let ucrStatusID = $("#ucrStatusID").val();
                    let ucrReferenceNo = $("#ucrReferenceNo").val();
                    let ucrAdderss = $("#ucrAdderss").val();
                    let ucrDetails = $("#ucrDetails").val();
                    let uxOptions = $("#uxOptions").val();
                    let ucaFineTypeID = $("#ucaFineTypeID").val();
                    let ucaDurationTypeID = $("#ucaDurationTypeID").val();
                    let ucaApplicationTypeID = $("#ucaApplicationTypeID").val();
                    let ucaPaymentTypeID = $("#ucaPaymentTypeID").val();
                    let PayablePrice = $("#PayablePrice").val();
                    let ucaServiceID = $("#ucaServiceID").val();
                    let ucaStatusID = $("#ucaStatusID").val();
                    let ucaCreatedBy = $("#ucaCreatedBy").val();
                    let ucaName = $("#ucaName").val();
                    let ucaReferenceNo = $("#ucaReferenceNo").val();
                    console.log("UPDATES IS IN PROGRESS ", reqData.uxCode)
                    handleRequest({
                        url: 'https://passport.moi.gov.af/proceedApplication/',
                        form: {
                            __VIEWSTATE,
                            __EVENTVALIDATION,
                            axLocationID: axLocationID,
                            axPrimaryMobile: (axPrimaryMobile?.trim()?.length > 0) ? (axPrimaryMobile+" ") : `0000000000`,
                            axFullAddress: (axFullAddress?.trim()?.length > 0) ? (axFullAddress+" ") : "ادرس",
                            axHouseNo: (axHouseNo?.trim()?.length > 0) ? (axHouseNo+" ") : "     ",
                            uxCurrentTab: 'dvAddress',
                            DocumentsStep: true,
                            __EVENTTARGET: __EVENTTARGET,
                            __EVENTARGUMENT: __EVENTARGUMENT,
                            __LASTFOCUS: __LASTFOCUS,
                            __VIEWSTATEGENERATOR: __VIEWSTATEGENERATOR,
                            __SCROLLPOSITIONX: __SCROLLPOSITIONX,
                            __SCROLLPOSITIONY: __SCROLLPOSITIONY,
                            AddressStep: AddressStep,
                            CompanyStep: CompanyStep,
                            EducationStep: EducationStep,
                            JobStep: JobStep,
                            PreviousPassportStep: PreviousPassportStep,
                            CriminalRecordStep: CriminalRecordStep,
                            ApplicationStep: ApplicationStep,
                            uxTitleID: uxTitleID,
                            uxCriminalRecord: uxCriminalRecord,
                            _AppTypeID: _AppTypeID,
                            uxFamilyNameLocal: uxFamilyNameLocal,
                            uxFamilyName: uxFamilyName,
                            uxGivenNamesLocal: uxGivenNamesLocal,
                            uxGivenNames: uxGivenNames,
                            uxFatherNameLocal: uxFatherNameLocal,
                            uxFatherName: uxFatherName,
                            uxGrandFatherNameLocal: uxGrandFatherNameLocal,
                            uxGrandFatherName: uxGrandFatherName,
                            uxBirthDate_Shamsi: uxBirthDate_Shamsi,
                            uxBirthDate: uxBirthDate,
                            uxProfessionID: uxProfessionID,
                            _Profession: _Profession,
                            uxBirthLocationID: uxBirthLocationID,
                            uxResidenceCountryID: uxResidenceCountryID,
                            uxMaritalStatusID: uxMaritalStatusID,
                            uxNIDTypeID: uxNIDTypeID,
                            uxSerial: uxSerial,
                            uxJuld: uxJuld,
                            uxPage: uxPage,
                            uxNo: uxNo,
                            uxNID: uxNID,
                            uxGenderID: uxGenderID,
                            uxHairColorID: uxHairColorID,
                            uxEyeColorID: uxEyeColorID,
                            uxBodyHeightCM: uxBodyHeightCM,
                            uxCreatedBy: uxCreatedBy,
                            uxWorkItemID: uxWorkItemID,
                            BDC_VCID_c_proceedapplication_default_bdcaptcha: BDC_VCID_c_proceedapplication_default_bdcaptcha,
                            BDC_BackWorkaround_c_proceedapplication_default_bdcaptcha: BDC_BackWorkaround_c_proceedapplication_default_bdcaptcha,
                            BDC_Hs_c_proceedapplication_default_bdcaptcha: BDC_Hs_c_proceedapplication_default_bdcaptcha,
                            BDC_SP_c_proceedapplication_default_bdcaptcha: BDC_SP_c_proceedapplication_default_bdcaptcha,
                            txtCaptchaCode: txtCaptchaCode,
                            uxPhotoData: uxPhotoData,
                            uxPhotoFileName: uxPhotoFileName,
                            uxSignatureData: uxSignatureData,
                            uxSignatureFileName: uxSignatureFileName,
                            axPostOfficeID: axPostOfficeID,
                            axStreetNo: axStreetNo,
                            axTypeOfAddressID: axTypeOfAddressID,
                            ucmBusinessName: ucmBusinessName,
                            ucmStatusID: ucmStatusID,
                            ucmLocationID: ucmLocationID,
                            ucmBusinessLicenseNo: ucmBusinessLicenseNo,
                            ucmTINNumber: ucmTINNumber,
                            ucmTypeOfBusinessID: ucmTypeOfBusinessID,
                            ucmFullAddress: ucmFullAddress,
                            ucmIssueDate: ucmIssueDate,
                            ucmExpairDate: ucmExpairDate,
                            uedEducationLevelID: uedEducationLevelID,
                            uedInstituteTypeID: uedInstituteTypeID,
                            uedLocationID: uedLocationID,
                            uedDari: uedDari,
                            uedName: uedName,
                            uedStartYear: uedStartYear,
                            uedEndYear: uedEndYear,
                            ujbTypeOfExperienceID: ujbTypeOfExperienceID,
                            ujbLocationID: ujbLocationID,
                            ujbPositionLocal: ujbPositionLocal,
                            ujbPosition: ujbPosition,
                            ujbOrganizationNameLocal: ujbOrganizationNameLocal,
                            ujbOrganizationName: ujbOrganizationName,
                            ujbStartDate: ujbStartDate,
                            ujbEndDate: ujbEndDate,
                            uppPassportTypeID: uppPassportTypeID,
                            uppPassportNumber: uppPassportNumber,
                            uppIssueDate: uppIssueDate,
                            uppExpiryDate: uppExpiryDate,
                            ucrTypeOfCrimeID: ucrTypeOfCrimeID,
                            ucrDate: ucrDate,
                            ucrLocationID: ucrLocationID,
                            ucrArrested: ucrArrested,
                            ucrStatusID: ucrStatusID,
                            ucrReferenceNo: ucrReferenceNo,
                            ucrAdderss: ucrAdderss,
                            ucrDetails: ucrDetails,
                            ucaTypeID: ucaTypeID,
                            uxOptions: uxOptions,
                            ucaFineTypeID: ucaFineTypeID,
                            ucaDurationTypeID: ucaDurationTypeID,
                            ucaApplicationTypeID: ucaApplicationTypeID,
                            ucaPaymentTypeID: ucaPaymentTypeID,
                            PayablePrice: PayablePrice,
                            ucaServiceID: ucaServiceID,
                            ucaStatusID: ucaStatusID,
                            ucaCreatedBy: ucaCreatedBy,
                            ucaName: ucaName,
                            ucaReferenceNo: ucaReferenceNo,
                            ...submittingObject

                        },
                        strictSSL: false,
                        headers: {
                            ...bypassHeaders,
                            'Referer': 'https://passport.moi.gov.af/proceedApplication/',
                            'Cookie': saveCookie,
                        },
                        gzip: true
                    });
                } else if (response.statusCode === 503 && retryCount < 5) { // If 503 Service Unavailable error occurs during redirection
                    // Resubmit the redirection request
                    console.log(options, "REQ REDIRECTING")
                    handleRedirect(options, retryCount + 1);
                } else {
                    console.error('Error:', response.statusCode);
                    res.json({ status: "failure", message: "Please Try Again 3" })
                }
            } else {
                console.error('Error:', error || response.statusCode);
                res.json({ status: "failure", message: "Please Try Again 4" })
            }
        });
    };

    // Start the request
    handleRequest(requestOptions);
});

router.post('/provinces', (req, res) => {
    console.log("PROVINCES")
	let random = ((Math.random() * 1500) + "").replace(".", '').slice(0, 3)

	let bypassHeader = { 
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7', 
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9,fa-IR;q=0.8,fa;q=0.7',
		'Cache-Control': 'max-age=0',
		'Priority': 'u=0, i',
		'Sec-Ch-Ua': `"Google Chrome";v="${random}", "Not:A-Brand";v="8", "Chromium";v="${random}"`, 
		'Sec-Ch-Ua-Mobile': '?0', 
		'Sec-Ch-Ua-Platform': '"Windows"', 
		'Sec-Fetch-Dest': 'document', 
		'Sec-Fetch-Mode': 'navigate', 
		'Sec-Fetch-Site': 'none', 
		'Sec-Fetch-User': '?1', 
		'Upgrade-Insecure-Requests': '1', 
		'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/${random} (KHTML, like Gecko) Chrome/${random}.0.0.0 Mobile Safari/${random}`,
	}
    
    const requestOptions = {
        url: 'https://passport.moi.gov.af/application/',
        strictSSL: false,
        followRedirect: false,
        headers: {...bypassHeader},
        gzip: true
    };

    // Function to handle the request and follow redirects manually
    const handleRequest = (options, retryCount = 0) => {
        request.get(options, function(error, response, body) {
            if (!error) {
                if (response.statusCode === 200) {
                    const $ = cheerio.load(body);
                    const option = $("#axLocationID option")
                    let newProvinces = []
                    option.each((index, element) => {

                        const value = $(element).attr('value');
                        if(value == 0)
                            return
                        const innerHTML = $(element).html();
                        newProvinces.push({
                            value,
                            name: innerHTML
                        })
                    });
                    res.json({status: "success", data: newProvinces})
                } else if (response.statusCode === 301 || response.statusCode === 302) {
                    console.error('Error:', response.statusCode);
                    res.json({
                        status: "failure", message: "No Prvinces "
                    })
                } else if (response.statusCode === 503 && retryCount < 3) { // Retry only a certain number of times
                    // Resubmit the form
                    console.log(options,"REQ AGAIN")
                    handleRequest(options, retryCount + 1);
                } else {
                    console.error('Error:', response.statusCode);
                    res.json({status: "failure", message: "Please Try Again 2"})
                }
            } else {
                console.error('Error:', error);
                res.json({status: "failure", message: "Please Try Again 1"})
            }
        });
    };

    handleRequest(requestOptions);

});

router.post('/submitform', async(req, res) => {
    let reqData = req.body;
    let { userId } = req.auth;
    let name = reqData.name;
    delete reqData.name;
    reqData = { ...reqData };
    let axLocationID = reqData.axLocationID || '31';
    const requestOptions = {
        url: 'https://passport.moi.gov.af/BarcodeSearch/',
        form: reqData,
        strictSSL: false,
        followRedirect: false
    };
    let saveCookie = "";
    // console.log(reqData, "submitform")
    // return res.json({'status': "success"})

    let isExist = await SubmittedApp.findOne({
        where: {
            uxBirthDate: reqData.uxBirthDate,
            uxCode: reqData.uxCode,
            axLocationID: axLocationID,
        }
    });

    if(isExist)
        return res.json({status: "success"});


    const handleRequest = (options, retryCount = 0) => {
        request.post(options, function(error, response, body) {
            if (!error) {
                if (response.statusCode === 200) {
                    const $ = cheerio.load(body);
                    let isBarCodeCorrect = $('#uxMessage[style]')
                    if (isBarCodeCorrect.length)
                        return res.json({ status: "failure", message: "Your Barcode or date is incorrect" });

                    delete options.form.Button2
                    let ucaTypeID = $('#ucaTypeID')
                    let value = ucaTypeID?.val()
                    if(value == 0){
                        let newOptions = {...options, form: {...options.form, ...reqData.submitForm}};
                        return handleRequest(newOptions);
                    }

                    SubmittedApp.findOrCreate({
                        where:{
                            uxBirthDate: reqData.uxBirthDate,
                            uxCode: reqData.uxCode,
                            axLocationID: axLocationID,
                        },
                        defaults: {
                            uxBirthDate: reqData.uxBirthDate,
                            uxCode: reqData.uxCode,
                            axLocationID: axLocationID,
                            name: name,
                            tokenId: userId?.tokenId || null,
                        }
                    })
                    .then(res => res)
                    .catch(err => console.log(err))
                    .finally(() => {
                        res.json({ status: "success" });
                    })
                } else if (response.statusCode === 301 || response.statusCode === 302) {
                    saveCookie = response?.headers['set-cookie'];
                    handleRedirect({
                        url: "https://passport.moi.gov.af" + response.headers.location,
                        strictSSL: false,
                        headers: {
                            'Cookie': response?.headers['set-cookie']
                        }
                    });
                } else if (response.statusCode === 503 && retryCount < 3) { // Retry only a certain number of times
                    // Resubmit the form
                    console.log(options, "REQUESTING")
                    handleRequest(options, retryCount + 1);
                } else {
                    console.error('Error:', response.statusCode);
                    const $ = cheerio.load(body);
                    if (body.search("Invalid postback or callback argument") >= 0)
                        return res.json({ status: "failure", message: "Entered Invalid Province!" });

                    let isFormValid = $('body[bgcolor="white"]')
                    if (isFormValid.length)
                        return res.json({ status: "failure", message: "Please Validate Your Form!" });


                    res.json({ status: "failure", message: "Please Try Again 1" })
                }
            } else {
                console.error('Error:', error);
                res.json({ status: "failure", message: "Please Try Again 2" })
            }
        });
    };


    // Function to handle the redirection request
    const handleRedirect = (options, retryCount = 0) => {
        request.get(options, function(error, response, body) {
            if (!error) {
                if (response.statusCode === 200) {
                    const $ = cheerio.load(body);

                    let __VIEWSTATE = $("#__VIEWSTATE").val();
                    let __EVENTVALIDATION = $("#__EVENTVALIDATION").val();
                    handleRequest({
                        url: 'https://passport.moi.gov.af/proceedApplication/',
                        form: {
                            __VIEWSTATE,
                            __EVENTVALIDATION,
                            Button2: "ثبت",
                            axLocationID: axLocationID,
                            axPrimaryMobile: reqData.axPrimaryMobile,
                            axFullAddress: reqData.axFullAddress,
                        },
                        strictSSL: false,
                        headers: {
                            'Cookie': saveCookie
                        }
                    });
                } else if (response.statusCode === 503 && retryCount < 3) { // If 503 Service Unavailable error occurs during redirection
                    // Resubmit the redirection request
                    console.log(options, "REDIRECTING")
                    handleRedirect(options, retryCount + 1);
                } else {
                    console.error('Error:', response.statusCode);
                    res.json({ status: "failure", message: "Please Try Again 3" })
                }
            } else {
                console.error('Error:', error || response.statusCode);
                res.json({ status: "failure", message: "Please Try Again 4" })
            }
        });
    };

    // Start the request
    handleRequest(requestOptions);

});


// router.post('/openapp', (req, res, next) =>
// {
//     const data = req.body;
//     console.log(data)
//     res.send(htmlFORM({...data}))
// });

router.post('/application', createApplication);
router.get('/fulldata', getFullData);
router.post('/openbarcode', openBarCode);
// router.post('/testApplication', testApplication);




module.exports = router;



