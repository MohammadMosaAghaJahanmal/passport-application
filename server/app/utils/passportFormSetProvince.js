const request = require("request");
const cheerio = require('cheerio');

const passportFormSetProvince = async (req, res, reqData, saveCookie, isExist) => {
	let random = ((Math.random() * 1500) + "").replace(".", '').slice(0, 3)
    // console.log("TRING TO SAVE FROM SEARCH FORM", saveCookie, reqData)
    
    // return res.json({status: "success", data: []});
  let axLocationID = reqData.axLocationID || '31';
  const bypassHeaders = { 
    //   'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7', 
    //   'Accept-Language': 'en-US,en;q=0.9', 
    //   'Cache-Control': 'no-cache', 
    //   'Pragma': 'no-cache', 
    //   'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"', 
    //   'Sec-Ch-Ua-Mobile': '?0', 
    //   'Sec-Ch-Ua-Platform': '"Windows"', 
    //   'Sec-Fetch-Dest': 'document', 
    //   'Sec-Fetch-Mode': 'navigate', 
    //   'Sec-Fetch-Site': 'same-origin', 
    //   'Sec-Fetch-User': '?1', 
    //   'Upgrade-Insecure-Requests': '1', 
    //   'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Cookie': saveCookie
  }
  const requestOptions = {
      url: 'https://passport.moi.gov.af/search/default.aspx',
      form: reqData,
      strictSSL: false,
      followRedirect: false,
      headers: bypassHeaders
  };

  let uxCode = null;
  if(!isExist)
      return res.json({status: "failure", message: "This Application is not registered at the system"});
  if(isExist?.isChanged && isExist?.axLocationID == axLocationID)
      return res.json({status: "success", data: isExist});

  const handleRequest = (options, retryCount = 0) => {
      request.post(options, function(error, response, body) {
          if (!error) {
              if (response.statusCode === 200) {

                  const $ = cheerio.load(body);
                  if(uxCode === null && $('#uxCode')?.attr("value")?.length > 3)
					uxCode = $('#uxCode')?.attr("value");
                    
                  let isBarCodeCorrect = $('#uxMessage[style]')
                  if (isBarCodeCorrect.length)
                  return res.json({ status: "failure", message: "Your Credintials or date is incorrect" });

                  isExist.isChanged = true;
                  if(uxCode != null && uxCode?.length > 3)
                    isExist.uxCode = uxCode;
                  isExist.axLocationID = axLocationID;
                  isExist.save()
                  .then(res => res)
                  .catch(err => {
                    console.log(err)
                    isExist.uxCode = uxCode + "_" + random;
                    isExist.axLocationID = axLocationID;
                    isExist.isChanged = true;
                    return isExist.save()
                    })
                  .finally(() => {
                      res.json({ status: "success", data:isExist });
                  })
                      // res.json({ status: "success" });
              } else if (response.statusCode === 301 || response.statusCode === 302) {
                  console.log("REQUEST_HANDLER", response.statusCode, "https://passport.moi.gov.af" + response.headers.location)
                  if(("https://passport.moi.gov.af" + response.headers.location).search("Error/Maintenance") >= 0)
                      return res.json({status: "failure", message: "Please Validate Your Application!"})
                  handleRedirect({
                      url: "https://passport.moi.gov.af" + response.headers.location,
                      strictSSL: false,
                      headers: bypassHeaders
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
                          axPrimaryMobile: (axPrimaryMobile?.trim()?.length > 0) ? (axPrimaryMobile+"0") : `07${random}4567`,
                          axFullAddress: (axFullAddress?.trim()?.length > 0) ? (axFullAddress+"0") : "ادرس"
                      },
                      strictSSL: false,
                      headers: bypassHeaders
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
}

module.exports = passportFormSetProvince;