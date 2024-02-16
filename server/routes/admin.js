// const axios  = require('axios');
const express = require('express');
const router = express.Router();
const { createToken, updateToken, deleteToken, getToken, getOneToken } = require('../app/controllers/token');

router.post('/token',  createToken);
router.put('/token',  updateToken);
router.delete('/token',  deleteToken);
router.get('/token',  getToken);
router.get('/token/query',  getOneToken);

module.exports = router;



