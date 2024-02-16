const { checkToken } = require("./jwtGenerator");



const getUserFromToken = async (req, res, next) =>
{
  const token = req.headers?.authorization?.replace("bearer ", "");
  if(token)
  {
      let result = checkToken(token);
      if(result?.userId?.id)
      {
        
        req.tokenUser = result?.userId;
        return next();
      }
  }
  req.tokenUser = {};
  return next();
}


module.exports = {getUserFromToken};