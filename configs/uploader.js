const multer = require("multer");
const fs = require("fs");

module.exports = {
  uploader: (directory, fileNamePrefix) => {
    // directory storage file
    let defaultDir = "./public";

    //diskstorage : to save file from FE to BE
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const pathDir = deaultDir + directory;

        if (fs.existsSync(pathDir)) {
          console.log("Directory exists");
          cb(null, pathDir);
        } else {
          fs.mkdir(pathDir, { recursive: true }, (err) => cb(err, pathDir));
        }
      },
      filename: (req, file, cb) => {
        let ext = file.originalname.split(".");
        letfilename = fileNamePrefix + Date.now() + "." + ext[ext.length - 1];
        cb(null, filename);
      },
    });

    const fileFilter = (req, file, cb) => {
      const ext = /\.(jpg|jpeg|png|gif|pdf|txt|JPG|PNG|JPEG)/;
      if (!file.originalname.match(ext)) {
        return cb(new Error("Your file is not compatible"), false);
      }
      cb(null, true);
    };
    return multer({
      storage,
      fileFilter,
    });
  },
};
