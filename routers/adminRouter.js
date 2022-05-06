const router = require('express').Router();
const { adminController } = require('../controllers');

router.post('/all', adminController.getAdmins);
router.post('/create', adminController.createAdmin);

module.exports = router;
