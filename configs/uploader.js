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
    });
  },
  profileUploader: () => {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const path = './public/images/profile';

        if (fs.existsSync(path)) {
          cb(null, path);
        } else {
          fs.mkdir(path, { recursive: true }, (err) => cb(null, path));
        }
      },
      filename: (req, file, cb) => {
        const ext = file.originalname.split('.');

        const name = Date.now() + '.' + ext[ext.length - 1];

        cb(null, name);
      },
    });

    const fileFilter = (req, file, cb) => {
      if (!/\.(jpg|jpeg|png|img|JPG|JPEG|PNG|IMG)/.test(file.originalname)) {
        return cb(new Error('File type not supported'), false);
      } else {
        cb(null, true);
      }
    };

    return multer({ storage, fileFilter });
  },
};
