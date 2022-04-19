const router = require("express").Router();
const { productController } = require("../controllers");

router.post("/add", productController.add);
router.get("/all", productController.all);
router.get("/find/:id", productController.getProductById);
router.post("/query", productController.query);
router.get("/appearance", productController.appearance);
router.patch("/edit/:id", productController.edit);
router.delete("/delete/:id", productController.delete);
router.post("/restore/:id", productController.restore);

module.exports = router;
