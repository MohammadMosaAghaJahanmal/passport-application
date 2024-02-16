 const htmlFORM = ({barCode, date, __EVENTVALIDATION, __VIEWSTATE}) => {
  let HTML_TEXT = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>
      Easy Form
    </title>
  </head>

<body>
  <form method="post" action="https://passport.moi.gov.af/BarcodeSearch/" id="form2">
      
    <div class="aspNetHidden">
      <input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="${__VIEWSTATE}">
    </div>



    <div class="aspNetHidden">
      <input type="hidden" name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="768A9483">
      <input type="hidden" name="__SCROLLPOSITIONX" id="__SCROLLPOSITIONX" value="0">
      <input type="hidden" name="__SCROLLPOSITIONY" id="__SCROLLPOSITIONY" value="0">
      <input type="hidden" name="__EVENTTARGET" id="__EVENTTARGET" value="">
      <input type="hidden" name="__EVENTARGUMENT" id="__EVENTARGUMENT" value="">
      <input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="${__EVENTVALIDATION}">
    </div>

    <div class="form-group">
      <span id="uxMessage"></span>
    </div>
    <div class="form-group">
      <div class="labelReq">
        <span id="Label70" class="aspLabel">بارکود</span>
        <span class="redSpan">*</span>
      </div>
      <input name="uxCode" value="${barCode}" type="text" maxlength="50" id="uxCode" class="form-control" rule="{fn:'required'}" required="" placeholder="کود را وارد نمائید">
    </div>
    <div class="form-group">
      <div class="labelReq">
        <span id="Label3" class="aspLabel">تاریخ تولد به شمسی</span>
        <span class="redSpan">*</span>
      </div>
      <input name="uxBirthDate" value="${date}" type="text" maxlength="50" id="uxBirthDate" class="form-control date hasCalendarsPicker" rule="{fn:'required'}" required="" placeholder="تاریخ تولد خود را نظر به فورم وارد کنید">
    </div>
    <div class="form-btn">
      <input type="submit" name="uxSearch" value="جستجو" id="uxSearch" class="submit-btn">
    </div>
  </form>
  <button class="submit">SUBMIT</button>
  <script>
    const submit = document.querySelector(".submit")
    
    submit.onclick = () =>
    {
      document.querySelector("#uxSearch").click()
    }
  </script>
</body>
</html>
`
  return HTML_TEXT;
}



module.exports = htmlFORM;