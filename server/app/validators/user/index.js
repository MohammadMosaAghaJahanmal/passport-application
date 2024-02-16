const joi = require('joi')

const Schema = joi.object({
    username: joi.string().required(),
    password: joi.string().required(),
})

module.exports = (data)=> Schema.validate(data)