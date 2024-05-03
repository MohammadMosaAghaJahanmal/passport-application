// const axios  = require('axios');
const express = require('express');
const router = express.Router();
// const https = require("https")
const cheerio = require('cheerio');
const request  = require('request');
const SubmittedApp = require('../app/model/SubmittedApp');
const { createApplication, getFullData, testApplication } = require('../app/controllers/createApplication');
const NewForm = require('../app/model/NewForm');



router.post('/barcode', async (req, res) => {
    let reqData = req.body;
    let { userId } = req.auth;
    let name = reqData.name;
    delete reqData.name;
    reqData = { ...reqData };
    let axLocationID = reqData.axLocationID || '31';
    const bypassHeaders = { 
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7', 
        'Accept-Language': 'en-US,en;q=0.9', 
        'Cache-Control': 'no-cache', 
        'Pragma': 'no-cache', 
        'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"', 
        'Sec-Ch-Ua-Mobile': '?0', 
        'Sec-Ch-Ua-Platform': '"Windows"', 
        'Sec-Fetch-Dest': 'document', 
        'Sec-Fetch-Mode': 'navigate', 
        'Sec-Fetch-Site': 'same-origin', 
        'Sec-Fetch-User': '?1', 
        'Upgrade-Insecure-Requests': '1', 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    }
    const requestOptions = {
        url: 'https://passport.moi.gov.af/BarcodeSearch/',
        form: reqData,
        strictSSL: false,
        followRedirect: false,
        headers: bypassHeaders
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
        return res.json({status: "success"});

    const handleRequest = (options, retryCount = 0) => {
        request.post(options, function(error, response, body) {
            if (!error) {
                if (response.statusCode === 200) {
                    const $ = cheerio.load(body);
                    let isBarCodeCorrect = $('#uxMessage[style]')
                    if (isBarCodeCorrect.length)
                        return res.json({ status: "failure", message: "Your Barcode or date is incorrect" });
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
                            'Cookie': response?.headers['set-cookie'],
                            ...bypassHeaders,
                        }
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
        request.get(options, function(error, response, body) {
            if (!error) {
                if (response.statusCode === 200) {
                    const $ = cheerio.load(body);

                    let __VIEWSTATE = $("#__VIEWSTATE").val();
                    let __EVENTVALIDATION = $("#__EVENTVALIDATION").val();
                    let axPrimaryMobile = $("#axPrimaryMobile").val();
                    let axFullAddress = $("#axFullAddress").val();
                    handleRequest({
                        url: 'https://passport.moi.gov.af/proceedApplication/',
                        form: {
                            __VIEWSTATE,
                            __EVENTVALIDATION,
                            Button2: "ثبت",
                            axLocationID: axLocationID,
                            axPrimaryMobile: (axPrimaryMobile+"0") || "071234567",
                            axFullAddress: (axFullAddress+"0") || "address"
                        },
                        strictSSL: false,
                        headers: {
                            ...bypassHeaders,
                            'Cookie': saveCookie
                        }
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
    console.log(reqData)
    let uxCode = null;
    let uxSerial = reqData.uxSerial;
    delete reqData.uxSerial;
    let axLocationID = reqData.axLocationID || '31';
    const bypassHeaders = { 
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7', 
        'Accept-Language': 'en-US,en;q=0.9', 
        'Cache-Control': 'no-cache', 
        'Pragma': 'no-cache', 
        'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"', 
        'Sec-Ch-Ua-Mobile': '?0', 
        'Sec-Ch-Ua-Platform': '"Windows"', 
        'Sec-Fetch-Dest': 'document', 
        'Sec-Fetch-Mode': 'navigate', 
        'Sec-Fetch-Site': 'same-origin', 
        'Sec-Fetch-User': '?1', 
        'Upgrade-Insecure-Requests': '1', 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    }
    const requestOptions = {
        url: 'https://passport.moi.gov.af/search/default.aspx',
        form: reqData,
        strictSSL: false,
        followRedirect: false,
        headers: bypassHeaders
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
                    saveCookie = response?.headers['set-cookie'];

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
                    if(("https://passport.moi.gov.af" + response.headers.location).search("Error/Maintenance") >= 0)
                        return res.json({status: "failure", message: "Please Validate Your Application!"})
                    handleRedirect({
                        url: "https://passport.moi.gov.af" + response.headers.location,
                        strictSSL: false,
                        headers: {
                            'Cookie': saveCookie,
                            ...bypassHeaders,
                        }
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
        request.get(options, function(error, response, body) {
            completeRequest++;
            if (!error) {
                if (response.statusCode === 200) {
                    const $ = cheerio.load(body);
                    console.log("FIRST REDIRECTING")

                    let __VIEWSTATE = $("#__VIEWSTATE").val();
                    let __EVENTVALIDATION = $("#__EVENTVALIDATION").val();
                    let axPrimaryMobile = $("#axPrimaryMobile").val();
                    let axFullAddress = $("#axFullAddress").val();
                    handleRequest({
                        url: 'https://passport.moi.gov.af/proceedApplication/',
                        form: {
                            __VIEWSTATE,
                            __EVENTVALIDATION,
                            Button2: "ثبت",
                            axLocationID: axLocationID,
                            axPrimaryMobile: (axPrimaryMobile+"0") || "0712345678",
                            axFullAddress: (axFullAddress+"0") || "address"
                        },
                        strictSSL: false,
                        headers: {
                            ...bypassHeaders,
                            'Cookie': saveCookie
                        }
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
    let bypassHeader = { 
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7', 
		'Accept-Language': 'en-US,en;q=0.9', 
		'Cache-Control': 'no-cache', 
		'Pragma': 'no-cache', 
		'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"', 
		'Sec-Ch-Ua-Mobile': '?1', 
		'Sec-Ch-Ua-Platform': '"Android"', 
		'Sec-Fetch-Dest': 'document', 
		'Sec-Fetch-Mode': 'navigate', 
		'Sec-Fetch-Site': 'none', 
		'Sec-Fetch-User': '?1', 
		'Upgrade-Insecure-Requests': '1', 
		'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',

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
// router.post('/testApplication', testApplication);




module.exports = router;



