const router = require("express").Router();
const { productController } = require("../controllers");


router.post("/add", productController.upload, productController.add);
router.get("/all", productController.all);
router.get("/find/:id", productController.getProductById);
router.post("/query", productController.query);
router.get("/appearance", productController.appearance);
router.patch("/edit/:id", productController.edit);
router.delete("/delete/:id", productController.delete);
router.post("/restore/:id", productController.restore);
router.get("/search", productController.search);
router.get("/sort", productController.sort);
router.get("/getProducts", productController.getProducts);

module.exports = router;
