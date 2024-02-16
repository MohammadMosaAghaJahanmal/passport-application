const path = require('path');
const fs = require("fs");


const uploadFolderPath = path.join(process.cwd(), "public", 'files', 'uploads');
const publicFolderPath = path.join(process.cwd(), "public");

if(!fs.existsSync(uploadFolderPath))
  fs.mkdirSync(uploadFolderPath);
  
const mimeType = ["pdf"];

const storeFile = async (fileInfo) =>
{
  
  const randomNumber = (Math.random() + "").replace(".", "");
  
  if(!fileInfo)
    return {
      status: "failure",
      message: "File Doesn't Exist !"
    };
  
  const orgFileName = fileInfo.originalFilename;
  const extName = path.extname(orgFileName);
  const fileOldPath = fileInfo.filePath;
  if(!mimeType.includes(extName.replace(".", "")))
    return {
      status: "failure",
      message: `Only Support (${mimeType}) File types`
    }
    

  const newFileName = ((fileInfo.newFilename +"."+ randomNumber) + extName);

  const date = new Date();

  const dateForFolderName = (date.toLocaleDateString()).replace(/\//ig, '-');
  const newUploadFolderPath = path.join(uploadFolderPath, dateForFolderName)
  

  if(!fs.existsSync(newUploadFolderPath))
    fs.mkdirSync(newUploadFolderPath);


  
  const fileNewPath = path.join(newUploadFolderPath, newFileName);

  try {

      fs.renameSync(fileOldPath, fileNewPath);


    return {
      status: "success",
      data: {
        name: newFileName,
        filePath: fileNewPath,
        dbPath: fileNewPath.replace(publicFolderPath, "")
      }
    }

  } catch (error) {
    return {
      status: "failure",
      message: error.message
    }
  }

  

} 



module.exports = storeFile;

