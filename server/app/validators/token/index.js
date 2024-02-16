const joi = require('joi')

const Schema = joi.object({
    token: joi.string().required(),
    deviceInfo: joi.string().optional().default(null),
    expireOn: joi.date().required(),
    employeeId: joi.number().optional().default(null),
    status: joi.boolean().default(true),
    phone: joi.string().max(15).optional().default(null),

})



module.exports = (data)=> Schema.validate(data)