const multer = require('multer');
const path = require('path');
const fs = require('fs');

module.exports = {
  imageProductUploader: () => {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const path = './public/images/products';

        if (fs.existsSync(path)) {
          cb(null, path);
        } else {
          fs.mkdir(path, { recursive: true }, (err) => cb(null, path));
        }
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
      },
    });

    return multer({
      storage: storage,
      fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const mimeType = fileTypes.test(file.mimetype);
        const extname = fileTypes.test(path.extname(file.originalname));

        if (mimeType && extname) {
          return cb(null, true);
        }
        cb('Give proper files formate to upload');
      },
      //   look for field "image"
    });
  },
};
