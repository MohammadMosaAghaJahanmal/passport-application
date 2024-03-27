const cheerio = require('cheerio');
const request  = require('request');
// const fs = require("fs");
// const path = require("path");
// const HTML_FILE_PATH = fs.readFileSync(path.join(process.cwd(), "passportHTML.html"))
const ac = require("@antiadmin/anticaptchaofficial");
const NewForm = require('../../model/NewForm');
ac.setAPIKey('be0f3a3a94868bae1ff1c534d6490680');
ac.setSoftId(0);


let base64Image = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABCCAYAAADXLcH0AAAAAXNSR0IArs4
c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAACxSURBVHhe7dChAcAgEMBA6P5b
/haY1nQFou5MfPbMvIvr9jnH6MDzl8uMjhgdMTpidMToiNERoyNGR4yOGB0xOmJ0xOiI0RGjI0ZHjI4YH
TE6YnTE6IjREaMjRkeMjhgdMTpidMToiNERoyNGR4yOGB0xOmJ0xOiI0RGjI0ZHjI4YHTE6YnTE6IjREa
MjRkeMjhgdMTpidMToiNERoyNGR4yOGB0xOmJ0xOiI0RGjE2t9N5gIGP/YYZ0AAAAASUVORK5CYII=`

// const $ = cheerio.load(HTML_FILE_PATH);



const createApplication = async(req, res) => {
	let reqData = req.body;
	let { userId } = req.auth;
	const tokenId = userId?.tokenId;
	const requestOptions = {
			url: 'https://passport.moi.gov.af/application/',
			strictSSL: false,
			followRedirect: false
	};
	const isExist = await NewForm.findOne({
		where: {
			uxSerial: reqData.uxSerial
		}
	})
	if(isExist)
		return res.json({status: "success", data: isExist})
		
		console.log(reqData);

	let saveCookie = "";
	let savedApp = null;

	let axPrimaryMobile = reqData.axPrimaryMobile
	delete reqData.axPrimaryMobile
	const handleRequest = (options, retryCount = 0, errCode) => {
		request.post(options, async function(error, response, body) {
			if (!error) {
				if (response.statusCode === 200) {
					const $ = cheerio.load(body);
					let uxCode = $('#uxCode')?.attr("value");
					let __EVENTVALIDATION = $('#__EVENTVALIDATION')?.attr("value");
					let __VIEWSTATE = $('#__VIEWSTATE')?.attr("value");
					let Image1 = $('#Image1')?.attr("src");
					let Image2 = $('#Image2')?.attr("src");
					let axPrimaryMobileElm = $('#axPrimaryMobile')?.attr("value");
					console.log(uxCode)
					if(uxCode || uxCode?.length > 10 && !savedApp)
					{
						try {
							savedApp = await NewForm.findOrCreate({
								where: {
									uxSerial: reqData.uxSerial
								},
								defaults: {
									...reqData, 
									uxCode,
									tokenId
								}
							});
							return res.json({status: "success", data: savedApp})
						} catch (error) {
							return res.json({status: "failure", message: "Entered Incorrect Data"})
						}
					}
					if(options?.form?.txtCaptchaCode.length > 3 && errCode === 503)
					{
						console.log("RETRING", retryCount);
						if(retryCount < 3)
							return handleRequest(options, retryCount + 1);

						return res.json({status: "failure", message: "Something went Wrong"})
					}
					if(!uxCode || uxCode?.length <=0 )
					{
						let getCaptcha = $('#c_application_default_bdcaptcha_CaptchaImage')?.attr("src");
						const captchaImageURL = "https://passport.moi.gov.af" + getCaptcha;
						saveCookie = response?.headers['set-cookie'];
						if(getCaptcha)
						{
							let imageOptions = {
								url: captchaImageURL, 
								encoding: null, 
								strictSSL: false,
								headers: {'Cookie': saveCookie}
							};
							const fetchCaptchaImage = (imgOptions, retry = 0) => {
								request.get(imgOptions, async function(err, resp, imageText) {
									if (!err && resp.statusCode === 200) {
										// Convert image to base64
										const captchaImageData = Buffer.from(imageText).toString('base64');
										
										try {
												let txtCaptchaCode = await ac.solveImage(captchaImageData, true)
												let secret1 = $('#BDC_VCID_c_application_default_bdcaptcha')?.attr("value");
												let secret2 = $('#BDC_BackWorkaround_c_application_default_bdcaptcha')?.attr("value");
												let secret3 = $('#BDC_Hs_c_application_default_bdcaptcha')?.attr("value");
												let secret4 = $('#BDC_SP_c_application_default_bdcaptcha')?.attr("value");
												let uxWorkItemID = $('#uxWorkItemID')?.attr("value");
												let ucaName = $('#uxWorkItemID')?.attr("value");

												
												const submitMainFormOptions = {
													...reqData,
													BDC_VCID_c_application_default_bdcaptcha: secret1,
													BDC_BackWorkaround_c_application_default_bdcaptcha: secret2,
													BDC_Hs_c_application_default_bdcaptcha: secret3,
													BDC_SP_c_application_default_bdcaptcha: secret4,
													__EVENTTARGET: "",
													__EVENTARGUMENT: "",
													__LASTFOCUS: "",
													__VIEWSTATEGENERATOR: "D73ECB15",
													__SCROLLPOSITIONX: 0,
													__SCROLLPOSITIONY: 1200,
													uxWorkItemID,
													txtCaptchaCode,
													uxSaveMainForm: "ثبت",
													__VIEWSTATE,
													__EVENTVALIDATION,
													ucaName,
													uxCurrentTab: 0,
													uxOptions: '{Fine: { 0:0 ,1:0,2:0,3:5500,4:24500,5:3250,6:0,7:0}, Duration: {0:0,1:1,2:2}, ApplicationType: {0:0,1:1,2:4,3:1}, TypeOfPassport: {0:0,1:5500,2:16000,3:6700,4:7000}, PaymentType: {0:0,1:0,2:-2250,3:-2250,4:-5500,5:0}}'
												} 
												handleRequest({
													url: requestOptions.url,
													form: submitMainFormOptions,
													strictSSL: false,
													headers: {
															'Cookie': saveCookie
													}
												}, -1);
										} catch (error) {
												return res.json({status: "failure", message: "Please Try Again. 10"})
										}

									} else if (resp.statusCode === 503 && retry < 3) {
										// Retry fetching captcha image
										console.log('Retry fetching captcha image:', retry + 1);
										fetchCaptchaImage(imgOptions, (retry + 1)); // Retry therequest
									} else { 
										console.error('Error fetching captcha image:', err || resp.statusCode);
										res.json({ status: "failure", message: "Error fetching captcha image" });
									}
								});
							};
							fetchCaptchaImage(imageOptions);
							return
						}
					} 
					else if(!(!uxCode || uxCode?.length <=0) && (Image1?.search("passport.moi") < 0 || Image2?.search("passport.moi") < 0))
					{
						return handleRequest({
							url: requestOptions.url,
							form: {
									__VIEWSTATE,
									__EVENTVALIDATION,
									Button4: "ثبت",
									uxPhotoData: base64Image,
									uxSignatureData: base64Image,
									uxPhotoFileName: "C:\\fakepath\\filepath.png",
									uxSignatureFileName: "C:\\fakepath\\filepath.png",
							},
							strictSSL: false,
							headers: {
									'Cookie': saveCookie
							}
						});
						
					}else if(!axPrimaryMobileElm || axPrimaryMobileElm?.length <=0)
					{
						return handleRequest({
							url: 'https://passport.moi.gov.af/proceedApplication/',
							form: {
									__VIEWSTATE,
									__EVENTVALIDATION,
									Button2: "ثبت",
									axLocationID: reqData.axLocationID || 31,
									axPrimaryMobile: axPrimaryMobile || "0712345678",
									axFullAddress: reqData.axFullAddress 
							},
							strictSSL: false,
							headers: {
									'Cookie': saveCookie
							}
						});
					}
					res.json({status: "success", data: savedApp})
				} else if (response.statusCode === 301 || response.statusCode === 302) {
					console.error('Error:', response.statusCode);
					console.error('Error:', response.headers['set-cookie']);
					res.json({
							status: "failure", message: "No Applicaiton is allowed to submit"
					})
				} else if (response.statusCode === 503 && retryCount < 3) { // Retry only a certain number of times
					// Resubmit the form
					console.log(options,"REQ AGAIN")
					handleRequest(options, retryCount + 1, 503);
				} else {
					if (body.search("Invalid postback or callback argument") >= 0)
						return res.json({ status: "failure", message: "Entered Invalid Province!" });
					console.error('Error:', response.statusCode);
					res.json({status: "failure", message: "Please Try Again 2"})
				}
			} else {
					console.error('Error:', error);
					res.json({status: "failure", message: "Please Try Again 1"})
			}
		});
	};


	// Start the request
	handleRequest(requestOptions);
}


const testApplication = async(req, res) => {
	let reqData = req.body;
	delete reqData.name;
	reqData = { ...reqData };
	const requestOptions = {
			url: 'https://passport.moi.gov.af/BarcodeSearch/',
			form: reqData,
			strictSSL: false,
			followRedirect: false
	};
	let saveCookie = "";
	const handleRequest = (options, retryCount = 0) => {
			request.post(options, function(error, response, body) {
					if (!error) {
							if (response.statusCode === 200) {
									const $ = cheerio.load(body);
									let isBarCodeCorrect = $('#uxMessage[style]')
									if (isBarCodeCorrect.length)
											return res.json({ status: "failure", message: "Your Barcode or date is incorrect" });
											res.json({ status: "success" });

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
											return res.json({ status: "failure", message: "Please Validate Your Form!", body });


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
								Button4: "ثبت",
								uxPhotoData: base64Image,
								uxSignatureData: base64Image,
								uxPhotoFileName: "C:\\fakepath\\filepath.png",
								uxSignatureFileName: "C:\\fakepath\\filepath.png",
						},
						strictSSL: false,
						headers: {
								'Cookie': saveCookie
						}
					});
				} else if (response.statusCode === 503 && retryCount < 3) { 
					
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
}


module.exports = {
	createApplication,
	testApplication
}