const formidable = require("formidable");


const fileFormValidator = (options = {multiples: false}) => async (req, res, next) =>
{
  const form = formidable({...options});

  form.parse(req, (err, fields, files) =>
  {
    if(err)
      return res.json({
        status: "failure",
        message: "Please Resubmit Your Form!",
        error: err.message
      })
      
      let keys = Object.getOwnPropertyNames(files);

      if(!options.multiples && keys.length >= 1)
      {
          let imageInfo = files[keys[0]];
          req.file = getUsableKeys(imageInfo, keys[0]);
      }

      if(options.multiples && keys.length >= 1)
      {
        let images = [];
        
        for (const imgField of keys) {
          let imageInfo = files[imgField];
          images.push(getUsableKeys(imageInfo, imgField));
        }

        req.files = images;
      }

      req.fields = fields;
      return next()
  })
}


function getUsableKeys(imageInfo, field) {
  return {
    field: field,
    filePath: imageInfo.filepath,
    newFilename: imageInfo.newFilename,
    originalFilename: imageInfo.originalFilename,
    mimetype: imageInfo.mimetype,
    size: imageInfo.size 
  }
}


module.exports = fileFormValidator;
