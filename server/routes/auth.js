// const axios  = require('axios');
const express = require('express');
const router = express.Router();
const { expressjwt } = require('express-jwt');
// const htmlFORM  = require('../app/utils/htmlFORM');
const rateLimit = require("express-rate-limit")

const { 
    authenticate, 
    loginAsToken 
  } = require('../app/utils/authenticate');
const { 
    easyFormAuth,
    easyFormLoginAsToken
  } = require('../app/utils/easyFormAuth');

const { seeder } = require('../app/controllers/seeder');
const SECRET = process.env.SECRET || "Rg7!sH9:easyform$jR212345";
const ALGORITHM = process.env.ALGORITHM || "HS256";

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: "Too many requests from this IP, please try again later.",
});


router.post('/easyform/login', apiLimiter, easyFormAuth);
router.post('/easyform/token', expressjwt({algorithms: [ALGORITHM], secret: SECRET}), easyFormLoginAsToken);

router.post('/admin/login', apiLimiter, authenticate);
router.post('/admin/token', expressjwt({algorithms: [ALGORITHM], secret: SECRET}), loginAsToken);

router.get('/api/seed',  seeder);





module.exports = router;



