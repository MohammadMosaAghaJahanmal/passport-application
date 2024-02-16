

const checkIfIdIsCorrect = (req, res, next) =>
{

  let id = null;
  
  if(req?.body?.id)
    id = req?.body?.id;

  if(req?.fields?.id)
    id = req?.fields?.id;


  if (!id)    
  return res.json({
      message: "Something went wrong. Please Try Again !",
      status: "failure",
      errorCode: 9
  });

  if(id.length !== 24)
      return res.json({
          message: "Something went wrong. Please Try Again !",
          status: "failure",
          errorCode: 10
      });

  next()

}


module.exports = checkIfIdIsCorrect;