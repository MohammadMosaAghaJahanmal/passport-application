// const axios  = require('axios');
const express = require('express');
const router = express.Router();
// const https = require("https")
const cheerio = require('cheerio');
const request  = require('request');
const SubmittedApp = require('../app/model/SubmittedApp');
const { createApplication, getFullData, testApplication, openBarCode } = require('../app/controllers/createApplication');
const NewForm = require('../app/model/NewForm');



router.post('/barcode', async (req, res) => {

    let reqData = req.body;
    console.log(reqData)
	let random = ((Math.random() * 1500) + "").replace(".", '').slice(0, 3)
    let { userId } = req.auth;
    let name = reqData.name;
    delete reqData.name;
    reqData = { ...reqData };
    let axLocationID = reqData.axLocationID || '31';
    const bypassHeaders = { 
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7', 
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9,fa-IR;q=0.8,fa;q=0.7',
        'Cache-Control': 'max-age=0',
        'Origin': 'https://passport.moi.gov.af',
        'Priority': 'u=0, i',
        'Referer': 'https://passport.moi.gov.af/BarcodeSearch/',
		'Sec-Ch-Ua': `"Google Chrome";v="${random}", "Not:A-Brand";v="8", "Chromium";v="${random}"`, 
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
		'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/${random} (KHTML, like Gecko) Chrome/${random}.0.0.0 Mobile Safari/${random}`,
    }
    
    const requestOptions = {
        url: 'https://passport.moi.gov.af/BarcodeSearch/',
        form: {
            "__VIEWSTATEGENERATOR": reqData.__VIEWSTATEGENERATOR,
            "__EVENTVALIDATION": reqData.__EVENTVALIDATION,
            "__SCROLLPOSITIONX": reqData.__SCROLLPOSITIONX,
            "__SCROLLPOSITIONY": reqData.__SCROLLPOSITIONY,
            "__EVENTARGUMENT":"",
            "__EVENTTARGET":"",
            "__VIEWSTATE": reqData.__VIEWSTATE,
            "uxBirthDate": reqData.uxBirthDate,
            "uxSearch": 'جستجو',
            "uxCode": reqData.uxCode,
        },
        strictSSL: false,
        followRedirect: false,
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

    const handleRequest = (options, retryCount = 0) => {
        request.post(options, function(error, response, body) {
            if (!error) {
                if (response.statusCode === 200) {
                    const $ = cheerio.load(body);
                    let isBarCodeCorrect = $('#uxMessage[style]')
                    if (isBarCodeCorrect.length)
                        return res.json({ status: "failure", message: "Your Barcode or date is incorrect" });
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
                        res.json({ status: "success" });
                    })
                } else if (response.statusCode === 301 || response.statusCode === 302) {

                    saveCookie = (response?.headers['set-cookie'] + "")?.replace("; path=/; HttpOnly", "");
                    if(("https://passport.moi.gov.af" + response.headers.location).search("/print") >= 0)
                        return res.json({status: "success", message: "The Process Is Already Completed!"});

                    if(("https://passport.moi.gov.af" + response.headers.location).search("Error/Maintenance") >= 0)
                        return res.json({status: "failure", message: "Please Validate Your Application!"});

                    if(response.headers?.location?.search('Maintenance') >= 0 || response.headers?.location?.search(/^\/{1}$/) == 0)
                        return res.json({status: "failure", message: "Maybe the province is not active or other problem beside validate your application"})
                    
                    console.log("BARCODE REDIRECTING TO", response.headers.location)
                    handleRedirect({
                        url: "https://passport.moi.gov.af" + response.headers.location,
                        strictSSL: false,
                        headers: {
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                            'Accept-Encoding': 'gzip, deflate, br, zstd',
                            'Accept-Language': 'en-US,en;q=0.9,fa-IR;q=0.8,fa;q=0.7',
                            'Cache-Control': 'max-age=0',
                            'Origin': 'https://passport.moi.gov.af',
                            'Priority': 'u=0, i',
                            'Referer': 'https://passport.moi.gov.af/BarcodeSearch/',
                            'Sec-Ch-Ua': `"Google Chrome";v="${random}", "Not:A-Brand";v="8", "Chromium";v="${random}"`, 
                            'Sec-Ch-Ua-Mobile': '?0',
                            'Sec-Ch-Ua-Platform': '"Windows"',
                            'Sec-Fetch-Dest': 'document',
                            'Sec-Fetch-Mode': 'navigate',
                            'Sec-Fetch-Site': 'same-origin',
                            'Sec-Fetch-User': '?1',
                            'Upgrade-Insecure-Requests': '1',
                            'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/${random} (KHTML, like Gecko) Chrome/${random}.0.0.0 Mobile Safari/${random}`,
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
                console.error('Error:', error);
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
                    let __EVENTVALIDATION = $("#__EVENTVALIDATION").val();
                    let axPrimaryMobile = $("#axPrimaryMobile").val();
                    let axFullAddress = $("#axFullAddress").val();
                    let axHouseNo = $("#axHouseNo").val();
                    let apo = $("#apo").val();
                    if(apo || apo?.length > 0)
                        return res.json({ status: "failure", message: "Please check the barcode from your browser" })
                    console.log("BARCODE IS SUBMITTING", response.method);
                    const option = $("#axLocationID option")
                    let newProvinces = false;
                    let isSelected = false;
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
                            return res.json({status: "success", data: Array.isArray(DBSavedForm) ? DBSavedForm[0] : DBSavedForm})
                        }
                    if(!newProvinces)
                        return res.json({status: "failure", message: "This Province is not active for change"})

                    console.log("UPDATES IS IN PROGRESS")
                    handleRequest({
                        url: 'https://passport.moi.gov.af/proceedApplication/', 
                        form: {
                            __VIEWSTATE,
                            __EVENTVALIDATION,
                            Button2: "ثبت",
                            axLocationID: axLocationID,
                            axPrimaryMobile: (axPrimaryMobile?.trim()?.length > 0) ? (axPrimaryMobile+" ") : `0000000000`,
                            axFullAddress: (axFullAddress?.trim()?.length > 0) ? (axFullAddress+" ") : "ادرس",
                            axHouseNo: (axHouseNo?.trim()?.length > 0) ? (axHouseNo+" ") : "     ",
                            uxCurrentTab: 'dvAddress',
                            // ucaName: '',
                            // DocumentsStep: true,
                            // AddressStep: true,
                            // CompanyStep: true,
                            // EducationStep: true,
                            // JobStep: true,
                            // PreviousPassportStep: true,
                            // CriminalRecordStep: true,
                            // ApplicationStep: true,
                            // _AppTypeID: 2,
                            // appSave: "ثبت",
                            // ucaTypeID: "1",
                            // ucaFineTypeID: "1",
                            // ucaApplicationTypeID: "1",
                            // ucaDurationTypeID: "1",
                            // ucaPaymentTypeID: "1",
                            // ucaReferenceNo: 'w'
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
                console.error('Error:', error || response.statusCode);
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
		'Sec-Ch-Ua': `"Google Chrome";v="${random}", "Not:A-Brand";v="8", "Chromium";v="${random}"`, 
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
		'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/${random} (KHTML, like Gecko) Chrome/${random}.0.0.0 Mobile Safari/${random}`,
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

    let completeRequest = 1;
    const handleRequest = (options, retryCount = 0) => {
        request.post(options, function(error, response, body) {
            if (!error) {
                if (response.statusCode === 200) {
                    saveCookie = (response?.headers['set-cookie'] + "")?.replace("; path=/; HttpOnly", "");

                    const $ = cheerio.load(body);
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

                    if(("https://passport.moi.gov.af" + response.headers.location).search("/print") >= 0)
                        return res.json({status: "success", message: "The Process Is Already Completed!"});

                    if(("https://passport.moi.gov.af" + response.headers.location).search("Error/Maintenance") >= 0)
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

                    let __VIEWSTATE = $("#__VIEWSTATE").val();
                    let __EVENTVALIDATION = $("#__EVENTVALIDATION").val();
                    let axPrimaryMobile = $("#axPrimaryMobile").val();
                    let axFullAddress = $("#axFullAddress").val();
                    let axHouseNo = $("#axHouseNo").val();
                    const option = $("#axLocationID option")
                    let newProvinces = false;
                    let isSelected = false;
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
                            return res.json({status: "success"})
                        }
                    if(!newProvinces)
                        return res.json({status: "failure", message: "This Province is not active for change"})
                    handleRequest({
                        url: 'https://passport.moi.gov.af/proceedApplication/',
                        form: {
                            __VIEWSTATE,
                            __EVENTVALIDATION,
                            Button2: "ثبت",
                            axLocationID: axLocationID,
                            axPrimaryMobile: (axPrimaryMobile?.trim()?.length > 0) ? (axPrimaryMobile+" ") : `0000000000`,
                            axFullAddress: (axFullAddress?.trim()?.length > 0) ? (axFullAddress+" ") : "ادرس",
                            axHouseNo: (axHouseNo?.trim()?.length > 0) ? (axHouseNo+" ") : "     ",
                            uxCurrentTab: 'dvAddress',

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
		'Accept-Language': 'en-US,en;q=0.9', 
		'Cache-Control': 'no-cache', 
		'Pragma': 'no-cache', 
		'Sec-Ch-Ua': `"Google Chrome";v="${random}", "Not:A-Brand";v="8", "Chromium";v="${random}"`, 
		'Sec-Ch-Ua-Mobile': '?1', 
		'Sec-Ch-Ua-Platform': '"Android"', 
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



