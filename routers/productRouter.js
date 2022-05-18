const router = require("express").Router();
const { productController } = require("../controllers");
const { imageProductUploader } = require("../configs/uploader");

router.post(
  "/add",

  imageProductUploader().single("image"),
  productController.add
);
router.get("/all", productController.all);
router.post("/find/:id", productController.getProductById);
router.post("/query", productController.query);
router.get("/appearance", productController.appearance);
router.patch(
  "/edit/:id",

  imageProductUploader().single("image"),
  productController.edit
);
router.delete("/delete/:id", productController.delete);
router.post("/restore/:id", productController.restore);

module.exports = router;
