const path = require("path");
const fs = require("fs");

const publicFolderPath = path.resolve("public");

const deleteImage = (imagePath) =>
{
  
  const fullPath = path.join(publicFolderPath, imagePath);

  console.log(imagePath,"_____")

  if(!fs.existsSync(fullPath))
    return true;

  fs.unlinkSync(fullPath);

  return true
}


module.exports = deleteImage;