const path = require('path');
const fs = require("fs");
const sharp = require("sharp");

const imageFolderPath = path.join(process.cwd(), "public", 'images');
const uploadFolderPath = path.join(process.cwd(), "public", 'images', 'uploads');
const publicFolderPath = path.join(process.cwd(), "public");

if(!fs.existsSync(imageFolderPath))
  fs.mkdirSync(imageFolderPath);

if(!fs.existsSync(uploadFolderPath))
  fs.mkdirSync(uploadFolderPath);
  
const mimeType = ["jpg", "png", "jpeg", "webp"];

  // (delTempImg) Mean Delete Uploaded Image from Temp Only when resize = true
const storeImage = async (imageInfo, resizeOptions = {resize: false, width: 0, height: 0, delTempImg: false}) =>
{
  
  const randomNumber = (Math.random() + "").replace(".", "");
  
  if(!imageInfo)
    return {
      status: "failure",
      message: "Image Doesn't Exist !"
    };
  
  const orgFileName = imageInfo.originalFilename;
  const extName = path.extname(orgFileName);
  const imgOldPath = imageInfo.filePath;

  if(!mimeType.includes(extName.replace(".", "")))
    return {
      status: "failure",
      message: `Only Support (${mimeType}) image types`
    }
    

  const newFileName = ((imageInfo.newFilename +"."+ randomNumber) + extName);

  const date = new Date();

  const dateForFolderName = (date.toLocaleDateString()).replace(/\//ig, '-');
  const newUploadFolderPath = path.join(uploadFolderPath, dateForFolderName)
  

  if(!fs.existsSync(newUploadFolderPath))
    fs.mkdirSync(newUploadFolderPath);


  
  const newImagePath = path.join(newUploadFolderPath, newFileName);

  try {

    if(!resizeOptions.resize)
      fs.renameSync(imgOldPath, newImagePath);

    if(resizeOptions.resize)
    {
      let resize = {};

      if(resizeOptions.height > 0)
        resize.height = resizeOptions.height;

      if(resizeOptions.width > 0)
        resize.width = resizeOptions.width;

      await sharp(imgOldPath)
      .resize({...resize})
      .toFile(newImagePath);
      
      if(resizeOptions.delTempImg)
        fs.unlinkSync(imgOldPath);
    }

    return {
      status: "success",
      data: {
        name: newFileName,
        imagePath: newImagePath,
        dbPath: newImagePath.replace(publicFolderPath, "")
      }
    }

  } catch (error) {
    return {
      status: "failure",
      message: error.message
    }
  }

  

} 



module.exports = storeImage;

