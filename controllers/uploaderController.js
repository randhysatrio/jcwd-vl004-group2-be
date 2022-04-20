// const db = require("../database");
const { uploader } = require("../configs/uploader");
const fs = require("fs");
const path = require("path");
const multer = require("multer");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimeType = fileTypes.test(file.mimeType);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb("Give proper files format to upload");
  },
}).single("image");

module.exports = { upload };

// module.exports = {
//   uploadFile: (req, res) => {
//     try {
//       let path = "/images";
//       const upload = uploader(path, "IMG").fields([{ name: "file" }]);

//       upload(req, res, (error) => {
//         if (error) {
//           console.log(error);
//           res.status(500).send(error);
//         }

//         const { file } = req.files;
//         const filepath = file ? path + "/" + file[0].filename : null;

//         let data = JSON.parse(req.body.data);

//         let sqlInsert = "Insert into album set ?";
//         db.query(sqlInsert, data, (err, results) => {
//           if (err) {
//             console.log(err);
//             fs.unlinkSync("./public" + filepath);
//             res.status(500).send(err);
//           }
//           req.status(200).send({ message: "Upload file success" });
//         });
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(500).send(error);
//     }
//   },
// };
