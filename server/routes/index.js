// const axios  = require('axios');
const express = require('express');
const router = express.Router();
// const https = require("https")
const cheerio = require('cheerio');
const request  = require('request');
const SubmittedApp = require('../app/model/SubmittedApp');
const { createApplication, testApplication } = require('../app/controllers/createApplication');


// const htmlFORM  = require('../app/utils/htmlFORM');
// const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// router.get('/Barcode',  async function(req, res, next) {
//   try {
//     const {data} = await axios.get('https://passport.moi.gov.af/BarcodeSearch/', {httpsAgent});
//     const $ = cheerio.load(data);
//     $('#uxCode').val('P31022010230124001');
//     $('#uxBirthDate').val('1388/11/18');
//     $("script").remove();
//     let a = $("#form2").clone();
//     a.attr().action = "/barcode"
//     a.attr().target = "_blank"
//     $("body div").remove();
//     $("head link").remove();
//     a.appendTo("body")
//     $("html").removeAttr("xmlns")
//     const modifiedHtml = $.html();
//     res.send(modifiedHtml)
//     // res.json({})
// } catch (error) {
//     console.error('Error:', error);
//     res.json({
// 			status: "failure", message: "Please Try Again"
// 		})
// }
// });


router.get("/", async (req, res, next) => {

    // try {
    //     let a = await ac.solveImage('', true)
    //     console.log(a, "_________")
    // } catch (error) {
    //     console.log(error)
    // }


    res.json({status: "success"})
})

router.post('/barcode', async (req, res) => {
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
                            'Cookie': response?.headers['set-cookie']
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
                            axPrimaryMobile: axPrimaryMobile,
                            axFullAddress: axFullAddress
                        },
                        strictSSL: false,
                        headers: {
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


router.post('/provinces', (req, res) => {
    console.log("PROVINCES")
    const requestOptions = {
        url: 'https://passport.moi.gov.af/application/',
        strictSSL: false,
        followRedirect: false
    };

    // Function to handle the request and follow redirects manually
    const handleRequest = (options, retryCount = 0) => {
        request.post(options, function(error, response, body) {
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




module.exports = router;



