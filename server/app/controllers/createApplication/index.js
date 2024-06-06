const cheerio = require('cheerio');
const request  = require('request');
const fs = require("fs");
const path = require("path");
const ac = require("@antiadmin/anticaptchaofficial");
const NewForm = require('../../model/NewForm');
const BOT_HTML = fs.readFileSync(path.join(process.cwd(), "bypassBot", 'index.html'), "utf-8");
const BOT_JS = fs.readFileSync(path.join(process.cwd(), "bypassBot", 'script.js'), "utf-8");
const {JSDOM} = require("jsdom");
const moment = require('moment-jalaali');
const passportFormSetProvince = require('../../utils/passportFormSetProvince');
const SubmittedApp = require('../../model/SubmittedApp');

function essaiToShamsi(essaiDate) {
	// Parse Gregorian date using JavaScript Date object
	const dateObj = new Date(essaiDate);
	const shamsiDate = moment(dateObj).locale('en').format('jYYYY/jMM/jDD');
	return shamsiDate;
}

ac.setAPIKey('be0f3a3a94868bae1ff1c534d6490680');
ac.setSoftId(0);


let base64Image = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABCCAYAAADXLcH0AAAAAXNSR0IArs4
c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAACxSURBVHhe7dChAcAgEMBA6P5b
/haY1nQFou5MfPbMvIvr9jnH6MDzl8uMjhgdMTpidMToiNERoyNGR4yOGB0xOmJ0xOiI0RGjI0ZHjI4YH
TE6YnTE6IjREaMjRkeMjhgdMTpidMToiNERoyNGR4yOGB0xOmJ0xOiI0RGjI0ZHjI4YHTE6YnTE6IjREa
MjRkeMjhgdMTpidMToiNERoyNGR4yOGB0xOmJ0xOiI0RGjE2t9N5gIGP/YYZ0AAAAASUVORK5CYII=`




const createApplication = async(req, res) => {
	let reqData = req.body;
	let { userId } = req.auth;
	let PROVINCE__EVENTVALIDATION = reqData?.__EVENTVALIDATION;
	let PROVINCE__VIEWSTATE = reqData?.__VIEWSTATE;
	delete reqData.__EVENTVALIDATION
	delete reqData.__VIEWSTATE
	reqData.uxBirthDate_Shamsi = essaiToShamsi(reqData.uxBirthDate);

	
	let random = ((Math.random() * 1500) + "").replace(".", '').slice(0, 3)
	let random2 = ((Math.random() * 1500) + "").replace(".", '')
	let saveCookie = "";
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
	const tokenId = userId?.tokenId;
	const requestOptions = {
			url: 'https://passport.moi.gov.af/application/default.aspx',
			strictSSL: false,
			followRedirect: false,
			headers: {...bypassHeader},
			method: 'GET',
			gzip: true
	};
	const isExist = await NewForm.findOne({
		where: {
			uxSerial: reqData.uxSerial
		}
	})
	if(isExist)
		return res.json({status: "success", data: isExist})
		

	let savedApp = null;

	let axPrimaryMobile = reqData.axPrimaryMobile
	let axLocationID = reqData.axLocationID
	let axFullAddress = reqData.axFullAddress
	delete reqData.axFullAddress
	delete reqData.axLocationID
	delete reqData.axPrimaryMobile
	// delete reqData.ucaDurationTypeID
	// delete reqData.ucaPaymentTypeID
	let try2Time = 1;
	const handleRequest = (options, retryCount = 0, errCode, METHOD = 'post') => {
		request[METHOD](options, async function(error, response, body) {
			if (!error) {
				if (response.statusCode === 200) {
					if (saveCookie?.length <= 0 && response?.headers['set-cookie']?.length > 0) 
						saveCookie = (response?.headers['set-cookie'] + "")?.replace("; path=/; HttpOnly", "");

					const $ = cheerio.load(body);
					const byPassHeaders = {
						'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
						'Accept-Encoding': 'gzip, deflate, br, zstd',
						'Accept-Language': 'en-US,en;q=0.9,fa-IR;q=0.8,fa;q=0.7',
						'Cache-Control': 'max-age=0',
						'Origin': 'https://passport.moi.gov.af',
						'Priority': 'u=0, i',
						'Referer': 'https://passport.moi.gov.af/application/default.aspx',
						'Sec-Ch-Ua': `"Google Chrome";v="${random}", "Not:A-Brand";v="8", "Chromium";v="${random}"`, 
						'Sec-Ch-Ua-Mobile': '?0',
						'Sec-Ch-Ua-Platform': '"Windows"',
						'Sec-Fetch-Dest': 'document',
						'Sec-Fetch-Mode': 'navigate',
						'Sec-Fetch-Site': 'same-origin',
						'Sec-Fetch-User': '?1',
						'Upgrade-Insecure-Requests': '1',
						'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/${random} (KHTML, like Gecko) Chrome/${random}.0.0.0 Mobile Safari/${random}`,
						'Cookie': saveCookie
					}
					let uxCode = $('#uxCode')?.attr("value");
					let messageText = $('.message')?.attr()
					let __EVENTVALIDATION = $('#__EVENTVALIDATION')?.attr("value");
					let __VIEWSTATE = $('#__VIEWSTATE')?.attr("value"); 
					let __VIEWSTATEGENERATOR = $('#__VIEWSTATEGENERATOR')?.attr("value");
					let __EVENTTARGET = $('#__EVENTTARGET')?.attr("value");
					let __EVENTARGUMENT = $('#__EVENTARGUMENT')?.attr("value");
					let __LASTFOCUS = $('#__LASTFOCUS')?.attr("value");
					const option = $("#axLocationID option")
					let newProvinces = false;
					option.each((index, element) => {

							const value = $(element).attr('value');
							if( value == axLocationID )
									newProvinces = true;
					});

					// let Image1 = $('#Image1')?.attr("src");
					// let Image2 = $('#Image2')?.attr("src");
					// let axPrimaryMobileElm = $('#axPrimaryMobile')?.attr("value");
					console.log(uxCode)
					
					if((uxCode?.length > 10) && savedApp==null)
					{
						try {
							savedApp = await NewForm.create({
								...reqData, 
								uxCode,
								tokenId,
							});
							console.log("TRYING TO SAVE")
							console.log("TRYING TO Province", uxCode)
							// if((uxCode?.search("P"+reqData?.uxResidenceCountryID) >= 0 || uxCode?.search("P0"+reqData?.uxResidenceCountryID) >= 0) && uxCode.search(reqData.uxBirthDate.replace(/[\/-]\d+/ig, '') >= 0))
							// {
							// 	console.log("CORRECT BARCODE")
							// 	return handleRequest({
							// 		url: requestOptions.url,
							// 		form: {
							// 				__VIEWSTATE,
							// 				__EVENTVALIDATION,
							// 				uxCode,
							// 				Button2: "ثبت",
							// 				axLocationID: axLocationID || 31,
							// 				axPrimaryMobile: axPrimaryMobile || "0712345678",
							// 				axFullAddress: axFullAddress || "شیستابنایستب",
							// 		},
							// 		strictSSL: false,
							// 		headers: {
							// 				...bypassHeader,
							// 				'Cookie': saveCookie
							// 		}
							// 	});
							// }
							if(!newProvinces)
								return res.json({status: "failure", message: "This Province is not active for change"})
							return passportFormSetProvince(req, res, {
								__VIEWSTATEGENERATOR: "59A49A67",
								__SCROLLPOSITIONX: "0",
								__SCROLLPOSITIONY: "500",
								__EVENTARGUMENT: "",
								__EVENTTARGET: "",
								__EVENTVALIDATION: PROVINCE__EVENTVALIDATION,
								__VIEWSTATE: PROVINCE__VIEWSTATE,
								uxName: reqData.uxGivenNamesLocal,
								uxFatherName: reqData.uxFatherNameLocal,
								uxGrandFatherName: reqData.uxGrandFatherNameLocal,
								uxBirthDate: reqData.uxBirthDate_Shamsi,
								uxSearch: "جستجو",
								axLocationID: axLocationID,
							}, saveCookie, (Array.isArray(savedApp) ? savedApp[0] : savedApp))

							// return res.json({status: "success", data: savedApp})
						} catch (dbErr) {
							console.log(dbErr.message, "ERR DATABASE DUPLICATE")
							savedApp = await NewForm.create({
								...reqData, 
								uxCode: (uxCode + "_" + random),
								tokenId,
							});
							console.log("TRYING TO SAVE")
							console.log("TRYING TO Province")
							if(!newProvinces)
								return res.json({status: "failure", message: "This Province is not active for change"})
							return passportFormSetProvince(req, res, {
								__VIEWSTATEGENERATOR: "59A49A67",
								__SCROLLPOSITIONX: "0",
								__SCROLLPOSITIONY: "500",
								__EVENTARGUMENT: "",
								__EVENTTARGET: "",
								__EVENTVALIDATION: PROVINCE__EVENTVALIDATION,
								__VIEWSTATE: PROVINCE__VIEWSTATE,
								uxName: reqData.uxGivenNamesLocal,
								uxFatherName: reqData.uxFatherNameLocal,
								uxGrandFatherName: reqData.uxGrandFatherNameLocal,
								uxBirthDate: reqData.uxBirthDate_Shamsi,
								uxSearch: "جستجو",
								axLocationID: axLocationID,
							}, saveCookie, (Array.isArray(savedApp) ? savedApp[0] : savedApp))
						}
					}
					if(options?.form?.txtCaptchaCode?.length > 3 && errCode === 503)
					{
						console.log("RETRING", retryCount);
						if(retryCount < 5)
						{
							handleRequest(options, retryCount + 1);
							return 
						}
						return res.json({status: "failure", message: "Something went Wrong 11"})
					}else if(options?.form?.txtCaptchaCode?.length > 3 && errCode !== 503 && !uxCode && try2Time > 2)
					{
						savedApp = await NewForm.create({
							...reqData, 
							tokenId,
							uxCode: random2,
						});
						if(!newProvinces)
							return res.json({status: "failure", message: "This Province is not active for change"})
						return passportFormSetProvince(req, res, {
							__VIEWSTATEGENERATOR: "59A49A67",
              __SCROLLPOSITIONX: "0",
              __SCROLLPOSITIONY: "500",
              __EVENTARGUMENT: "",
              __EVENTTARGET: "",
							__EVENTVALIDATION: PROVINCE__EVENTVALIDATION,
              __VIEWSTATE: PROVINCE__VIEWSTATE,
							uxName: reqData.uxGivenNamesLocal,
              uxFatherName: reqData.uxFatherNameLocal,
              uxGrandFatherName: reqData.uxGrandFatherNameLocal,
              uxBirthDate: reqData.uxBirthDate_Shamsi,
              uxSearch: "جستجو",
              axLocationID: axLocationID,
						}, saveCookie, (Array.isArray(savedApp) ? savedApp[0] : savedApp))
					}
					if((!uxCode || uxCode?.length <=0) && savedApp == null)
					{
						let getCaptcha = $('#c_application_default_bdcaptcha_CaptchaImage')?.attr("src");
						const captchaImageURL = "https://passport.moi.gov.af" + getCaptcha;
						if(getCaptcha)
						{
							let imageOptions = {
								url: captchaImageURL, 
								encoding: null, 
								strictSSL: false,
								headers: {
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
									'Cookie': saveCookie
								},
								gzip: true
							};
							const fetchCaptchaImage = (imgOptions, retry = 0) => {
								request.get(imgOptions, async function(err, resp, imageText) {
									if (!err && resp?.statusCode === 200) {
										
										const captchaImageData = Buffer.from(imageText).toString('base64');
										try {
												let txtCaptchaCode = await ac.solveImage(captchaImageData, true)
												let secret1 = $('#BDC_VCID_c_application_default_bdcaptcha')?.attr("value");
												let secret2 = $('#BDC_BackWorkaround_c_application_default_bdcaptcha')?.attr("value");
												let secret3 = $('#BDC_Hs_c_application_default_bdcaptcha')?.attr("value");
												let secret4 = $('#BDC_SP_c_application_default_bdcaptcha')?.attr("value");
												let uxWorkItemID = $('#uxWorkItemID')?.attr("value");
												let ucaName = $('#ucaName')?.attr("value");
												let uxCurrentTab = $('#uxCurrentTab')?.attr("value");
												let axTypeOfAddressID = $('#axTypeOfAddressID')?.attr("value");

												let botJS = BOT_JS.replace("XXXXX", secret1)
												let botHTML = BOT_HTML.replace("XXXXX", secret1)
												botHTML = botHTML.replace("XXXXX", secret1)
												botHTML = botHTML.replace("txtCaptchaCodeV", txtCaptchaCode)
												botHTML = botHTML.replace("BDC_BackWorkaround_c_application_default_bdcaptchaV", secret2)
												botHTML = botHTML.replace("BDC_Hs_c_application_default_bdcaptchaV", secret3)
												botHTML = botHTML.replace("BDC_SP_c_application_default_bdcaptchaV", secret4)
												let html = new JSDOM(botHTML,{ runScripts: "outside-only" });
												html.window.eval(botJS);
												html.window.setTimeout(() => {
													html.window.eval(`
													const keyupEvent = new KeyboardEvent('keyup', {keyCode: 65,  which: 65});
													const txtCaptchaCode = document.querySelector("#txtCaptchaCode");
													txtCaptchaCode.click();
													txtCaptchaCode.dispatchEvent(keyupEvent);
													`)
														
													const submitMainFormOptions = {
														...reqData,
														BDC_VCID_c_application_default_bdcaptcha: secret1,
														BDC_BackWorkaround_c_application_default_bdcaptcha: secret2,
														BDC_Hs_c_application_default_bdcaptcha: secret3,
														BDC_SP_c_application_default_bdcaptcha: secret4,
														__EVENTTARGET : __EVENTTARGET || "" ,
														__EVENTARGUMENT : __EVENTARGUMENT || "",
														__LASTFOCUS : __LASTFOCUS || "",
														__VIEWSTATEGENERATOR,
														__EVENTVALIDATION,
														__VIEWSTATE,
														__SCROLLPOSITIONX: Math.ceil(random / 3),
														__SCROLLPOSITIONY: 995,
														txtCaptchaCode: html.window.initBot.GetUserInputElement().value,
														uxSaveMainForm: "ثبت",
														_AppTypeID: 2,
														uxCurrentTab,
														uxWorkItemID,
														axTypeOfAddressID,
														ucaName,
														// uxBirthLocationID: 35,
														// uxResidenceCountryID: 35,
													} 
													try2Time++;
													


													const reqOptions = {
														url: requestOptions.url,
														form: submitMainFormOptions,
														strictSSL: false,
														headers: byPassHeaders,
														gzip: true
													}
														
													console.log({...reqOptions, form :{...reqOptions.form, __VIEWSTATE: "", __EVENTVALIDATION: ""}, headers: {} })
													handleRequest(reqOptions, -1);
												}, 1200)

										} catch (error) {
												console.log(error)
												return res.json({status: "failure", message: "Please Try Again. 10"})
										}

									} else if (resp?.statusCode === 503 && retry < 3) {
										// Retry fetching captcha image
										console.log('Retry fetching captcha image:', retry + 1);
										fetchCaptchaImage(imgOptions, (retry + 1)); // Retry therequest
									} else { 
										console.error('Error fetching captcha image:', err || resp?.statusCode);
										res.json({ status: "failure", message: "Error fetching captcha image" });
									}
								});
							};
							fetchCaptchaImage(imageOptions);
							return
						}
					} 
					// if((uxCode?.length > 10) && (Image1?.search("userPhoto") < 0) && savedApp != null)
					// {
					// 	console.log("SAVING IMAGE")
					// 	console.log(Image1)
					// 	console.log(Image2)
					// 	return handleRequest({
					// 		url: requestOptions.url,
					// 		form: {
					// 				__VIEWSTATE,
					// 				__EVENTVALIDATION,
					// 				uxCode,
					// 				Button4: "ثبت",
					// 				uxPhotoData: base64Image,
					// 				uxSignatureData: base64Image,
					// 				uxPhotoFileName: "C:\\fakepath\\filepath.png",
					// 				uxSignatureFileName: "C:\\fakepath\\filepath.png",
									
					// 		},
					// 		strictSSL: false,
					// 		headers: {
					// 				...bypassHeader,
					// 				'Cookie': saveCookie
					// 		}
					// 	});
						
					// }
					// if((!axPrimaryMobileElm || axPrimaryMobileElm?.length <=0) && savedApp != null)
					// {
					// 	console.log("SAVING PROVINCE", axPrimaryMobileElm)

					// 	return handleRequest({
					// 		url: requestOptions.url,
					// 		form: {
					// 				__VIEWSTATE,
					// 				__EVENTVALIDATION,
					// 				uxCode,
					// 				Button2: "ثبت",
					// 				axLocationID: reqData.axLocationID || 31,
					// 				// axLocationID: 35,
					// 				axPrimaryMobile: axPrimaryMobile || "0712345678",
					// 				axFullAddress: reqData.axFullAddress || "شیستابنایستب",
					// 				uxPhotoData: base64Image,
					// 				uxSignatureData: base64Image,
					// 				uxPhotoFileName: "C:\\fakepath\\filepath.png",
					// 				uxSignatureFileName: "C:\\fakepath\\filepath.png",
					// 		},
					// 		strictSSL: false,
					// 		headers: {
					// 				...bypassHeader,
					// 				'Cookie': saveCookie
					// 		}
					// 	});
					// }
						let savedForm = Array.isArray(savedApp) ? savedApp[0] : savedApp;
						savedForm.isChanged = true;
						await savedForm?.save()
					res.json({status: "success", data: savedForm})
				} else if (response.statusCode === 301 || response.statusCode === 302) {
					console.error('Error:', response.statusCode);
					console.error('Error:', body);
					res.json({
							status: "failure", message: "No Applicaiton is allowed to submit"
					})
				} else if (response.statusCode === 503 && retryCount < 4) { // Retry only a certain number of times
					// Resubmit the form
					console.log({...options, headers: {} },"REQ AGAIN")

					handleRequest(options, retryCount + 1, 503);
				} else {
						console.log(body, "BODY")
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
		handleRequest(requestOptions, 0, undefined, 'get');
}


const testApplication = async(req, res) => {
	let reqData = req.body;
	delete reqData.name;
	reqData = { ...reqData };
	const requestOptions = {
			url: 'http://passport.moi.gov.af/BarcodeSearch/',
			form: reqData,
			strictSSL: false,
			followRedirect: false
	};
	let saveCookie = "";
	const handleRequest = (options, retryCount = 0, METHOD = 'post') => {
			request[METHOD](options, function(error, response, body) {
					if (!error) {
							if (response.statusCode === 200) {
									const $ = cheerio.load(body);
									let isBarCodeCorrect = $('#uxMessage[style]')
									if (isBarCodeCorrect?.length)
											return res.json({ status: "failure", message: "Your Barcode or date is incorrect" });
											res.json({ status: "success" });

							} else if (response.statusCode === 301 || response.statusCode === 302) {
									saveCookie = response?.headers['set-cookie'];
									handleRedirect({
											url: "http://passport.moi.gov.af" + response.headers.location,
											strictSSL: false,
											headers: {
													'Cookie': response?.headers['set-cookie']
											}
									});
							} else if (response.statusCode === 503 && retryCount < 4) { // Retry only a certain number of times
									// Resubmit the form
									console.log(options, "REQUESTING")
									handleRequest(options, retryCount + 1);
							} else {
									console.error('Error:', response.statusCode);
									const $ = cheerio.load(body);
									if (body.search("Invalid postback or callback argument") >= 0)
											return res.json({ status: "failure", message: "Entered Invalid Province!" });

									let isFormValid = $('body[bgcolor="white"]')
									if (isFormValid?.length)
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
						url: 'http://passport.moi.gov.af/proceedApplication/',
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
				} else if (response.statusCode === 503 && retryCount < 4) { 
					
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

const getFullData = async (req, res) =>
{
	const {province,uxResidenceCountryID} = req.query;
	const query = {};
	if(province)
		query.axLocationID = province;
	if(uxResidenceCountryID)
		query.uxResidenceCountryID = uxResidenceCountryID;

	res.json({
		status: "success",
		data: await NewForm.findAll({where: query})
	})
}


const openBarCode =  async (req, res) => {
	let reqData = req.body;
	delete reqData.name;
	let random = ((Math.random() * 1500) + "").replace(".", '').slice(0, 3)
	const bypassHeaders = { 
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7', 
		'Accept-Encoding': 'gzip, deflate, br, zstd',
		'Accept-Language': 'en-US,en;q=0.9,fa-IR;q=0.8,fa;q=0.7',
		'Cache-Control': 'max-age=0',
		'Origin': 'https://passport.moi.gov.af',
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
			form: reqData,
			strictSSL: false,
			followRedirect: false,
			headers: bypassHeaders,
			gzip: true
	};
	if(reqData?.uxGrandFatherName?.length >= 1)
		{
			requestOptions.url = 'https://passport.moi.gov.af/search/default.aspx';
			bypassHeaders.Referer = 'https://passport.moi.gov.af/search/default.aspx';
			requestOptions.headers.Referer = 'https://passport.moi.gov.af/search/default.aspx'
		}
	console.log(requestOptions)
	let saveCookie = "";

	let completeRequest = 1;
	const handleRequest = (options, retryCount = 0) => {
			request.post(options, function(error, response, body) {
					if (!error) {
							if (response.statusCode === 200) {
									const $ = cheerio.load(body);
									let isBarCodeCorrect = $('#uxMessage[style]')
									if (isBarCodeCorrect.length)
											return res.json({ status: "failure", message: "Your Barcode or date is incorrect" });
									if(completeRequest <= 1 && retryCount < 5 && reqData?.uxGrandFatherName?.length >= 1)
                    {
												saveCookie = response?.headers['set-cookie'];
                        const reqHeaders = {...requestOptions, headers: {...requestOptions.headers, 'Cookie': saveCookie}};
                            handleRequest(reqHeaders, (retryCount + 1));
                        return
                    }
											return res.json({ status: "failure", message: "SOME THING HAPPEND TO GET DATA" });
							} else if (response.statusCode === 301 || response.statusCode === 302) {
									if(!reqData?.uxGrandFatherName)
										saveCookie = response?.headers['set-cookie'];

									handleRedirect({
											url: "https://passport.moi.gov.af" + response.headers.location,
											strictSSL: false,
											headers: {
													'Cookie': saveCookie,
													...bypassHeaders,
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
			request.get(options, function(error, response, body) {
				completeRequest++;
					if (!error) {
							if (response.statusCode === 200) {
									const $ = cheerio.load(body);
									let apo = $("#apo").val();
									if(apo || apo?.length > 0)
											return res.json({ status: "failure", message: "The Passport Process is completed" });

									let uxCode = $('#uxCode')?.val();
									let uxBirthDate_Shamsi = $('#uxBirthDate_Shamsi')?.val();
									let detailsAPPlace = $('#detailsAPPlace')?.text();
									console.log(detailsAPPlace);
									return res.json({
										status: "success",
										data: {
											barCode: uxCode,
											date: uxBirthDate_Shamsi,
											name: detailsAPPlace
										}
									})

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
}

module.exports = {
	createApplication,
	testApplication,
	getFullData,
	openBarCode
}