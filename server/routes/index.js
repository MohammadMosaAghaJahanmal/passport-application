// const axios  = require('axios');
const express = require('express');
const router = express.Router();
// const https = require("https")
const cheerio = require('cheerio');
const request  = require('request');
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

router.post('/barcode', (req, res) => {
  let reqData = req.body;
	reqData = {...reqData};
	let axLocationID = reqData.axLocationID || '31'
  const requestOptions = {
      url: 'https://passport.moi.gov.af/BarcodeSearch/',
      form: reqData,
      strictSSL: false,
      followRedirect: false
  };
  let saveCookie = "";

    const handleRequest = (options) => {
        request.post(options, function(error, response, body) {
            if (!error) {
                if (response.statusCode === 200) {
                    const $ = cheerio.load(body);
                    let isBarCodeCorrect = $('#uxMessage[style]')
                    if(isBarCodeCorrect.length)
                        return res.json({status: "failure", message: "Your Barcode or date is incorrect"}); 

                    res.json({status: "success"}); 
                } else if (response.statusCode === 301 || response.statusCode === 302) {
                    saveCookie = response.headers['set-cookie'];
                    handleRedirect({
                        url: "https://passport.moi.gov.af"+response.headers.location,
                        strictSSL: false,
                        headers: { 
                           'Cookie': response.headers['set-cookie']
                        }
                    });
                } else {
                    console.error('Error:', response.statusCode);
                    const $ = cheerio.load(body);
                    if(body.search("Invalid postback or callback argument") >= 0)
                        return res.json({status: "failure", message: "Entered Invalid Province!"});

                    let isFormValid = $('body[bgcolor="white"]')
                    if(isFormValid.length)
                        return res.json({status: "failure", message: "Please Validate Your Form!"}); 

                    
                    res.json({status: "failure", message: "Please Try Again 1"})
                }
            } else {
                console.error('Error:', error);
                res.json({status: "failure", message: "Please Try Again 2"})
            }
        });
    };

    // Function to handle the redirection request
    const handleRedirect = (options) => {
        request.get(options, function(error, response, body) {
            if (!error && response.statusCode === 200) {
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
                })

            } else {
                console.error('Error:', error || response.statusCode);
                res.json({status: "failure", message: "Please Try Again"})
            }
        });
    };

    // Start the request
    handleRequest(requestOptions);
    
});



router.post('/provinces', (req, res) => {

  const requestOptions = {
      url: 'https://passport.moi.gov.af/application/',
      strictSSL: false,
      followRedirect: false
  };

    // Function to handle the request and follow redirects manually
    const handleRequest = (options) => {
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
                        status: "failure", message: "Please Try Again"
                    })
                } else {
                    console.error('Error:', response.statusCode);
                    res.json({status: "failure", message: "Please Try Again"})
                }
            } else {
                console.error('Error:', error);
                res.json({status: "failure", message: "Please Try Again"})
            }
        });
    };

    handleRequest(requestOptions);
    
});



// router.post('/openapp', (req, res, next) =>
// {
//     const data = req.body;
//     console.log(data)
//     res.send(htmlFORM({...data}))
// });

module.exports = router;



