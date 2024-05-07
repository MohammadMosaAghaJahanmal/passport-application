const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
require("dotenv").config();
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const cookieSession = require("cookie-session");
const { expressjwt } = require('express-jwt');
const rejectUser = require("./app/utils/rejectUserReq")
const app = express();
const SECRET = process.env.SECRET || "Rg7!sH9:easyform$jR212345";
const ALGORITHM = process.env.ALGORITHM || "HS256";
const checkingToken = require("./app/utils/tokenChecker")
// const request = require("request");
// const {JSDOM} = require("jsdom");
// const fs = require("fs");
// const BOT_HTML = fs.readFileSync(path.join(process.cwd(), "bypassBot", 'index.html'), "utf-8");
// const BOT_JS = fs.readFileSync(path.join(process.cwd(), "bypassBot", 'script.js'), "utf-8");
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieSession({
  name: 'session',
  keys: ['easyform'],
  maxAge: 24 * 60 * 60 * 100
}));

app.use(cors({
  // origin: ['http://localhost:8081', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));
app.set('trust proxy', 1);
app.use('/v1/admin', expressjwt({algorithms: [ALGORITHM], secret: SECRET}), rejectUser("admin"), adminRouter);
app.use('/v1/auth', authRouter);
app.use('/v1/easyform', expressjwt({algorithms: [ALGORITHM], secret: SECRET}), checkingToken,  indexRouter);

app.use(function(req, res, next) {
  res.json({
    status: "failure",
    message: "Please Update Your Application"
  })
});

// app.use(async (req, res) => {

//     let botJS = BOT_JS.replace("XXXXX", "4958575131b6416f873c108dc3cf4543")
//     let botHTML = BOT_HTML.replace("XXXXX", "4958575131b6416f873c108dc3cf4543")
//     botHTML = BOT_HTML.replace("txtCaptchaCodeV", "ABCD3")
    
//     let html = new JSDOM(botHTML,{ runScripts: "outside-only" });
//     html.window.eval(botJS);
//     html.window.setTimeout(() => {
//         html.window.eval(`
//         const keyupEvent = new KeyboardEvent('keyup', {keyCode: 65,  which: 65});
//         const txtCaptchaCode = document.querySelector("#txtCaptchaCode");
//         txtCaptchaCode.click();
//         txtCaptchaCode.dispatchEvent(keyupEvent);
//         `)
//         console.log(html.window.initBot.GetUserInputElement().value)
//     }, 1000)
//     res.json({
//         status: "success",
//         botJS
//     })

// });


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
