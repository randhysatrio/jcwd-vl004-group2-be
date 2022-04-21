const router = require("express").Router();
const { userController } = require("../controllers");

router.get("/all", userController.get);
router.patch("/status/:id", userController.status);

module.exports = router;
