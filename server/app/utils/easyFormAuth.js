const Token = require("../model/Token");
const validator = require("../validators/token")
const errorHandler = require("../utils/errorHandler");
const {updateById} = require("../utils/CRUD");
const { checkToken } = require("./jwtGenerator");

const easyFormAuth = async (req, res, next) =>
{
    
    const {token, deviceInfo, phone} = req.body;
    const {error} = validator({...req.body, status: true, expireOn : "30"});
    if (error) {
        return errorHandler(error, res)
    }
    try {
        let result = checkToken(token?.trim());
        let tokenId = result?.userId?.tokenId;
        if(!tokenId)
            return res.json({
                message: "Entered Incorrect Token",
                status: "failure"
            })
        let findToken = await Token.findByPk(tokenId);
            console.log(findToken)
        if (!findToken) {
            return res.json({
                message: "Entered Incorrect Token",
                status: "failure"
            })
        }

        if (!findToken.status) {
            return res.json({
                message: "This Token is suspended by the Admin",
                status: "failure"
            })
        }
        let isDeviceExist = findToken.deviceInfo

        if (!isDeviceExist) {
            findToken = await updateById(tokenId, Token, {phone, deviceInfo})
            return  res.json({
                status: "success",
                token: findToken,
            })
        }
        
        if (isDeviceExist && (isDeviceExist !== deviceInfo)) {
            return res.json({
                message: "Token is alredy used by another device",
                status: "failure"
            })
        }

            
        res.json({
            token: findToken,
            status: "success",
        })

    } catch (error) {
        console.log(error)
        return res.json({status: "failure", message: "Please Login Again"})
    }
}


const easyFormLoginAsToken = async (req, res) =>
{
    const {deviceInfo} = req.body;
    const {tokenId} = req.auth.userId;
    if(!tokenId)
        return res.json({
            message: "Please Login To Your Account",
            status: "failure"
        })
    try {
    const findToken = await Token.findOne({where: { id: tokenId }});
    if(!findToken || !findToken?.status || (findToken?.deviceInfo != deviceInfo))
        return res.json({
            message: "Please Login To Your Account",
            status: "failure"
        })
        
    const status = "success";

        res.json({
            status,
            token: findToken
        });
    } catch (error) {
        return res.json({status: "failure", message: "Please Login To Your Account"})
    }

}


module.exports = {easyFormAuth, easyFormLoginAsToken}
