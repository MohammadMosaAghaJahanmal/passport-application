const rejectUserReq = (type) => (req, res, next) =>
{
  const logedinUser = req?.auth?.userId[type];
  if(!logedinUser)
    return res.json({status: "failure", message: "User Access Denied !"});

  next();

}



module.exports = rejectUserReq;