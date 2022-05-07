const router = require('express').Router();
const { adminController } = require('../controllers');

router.post('/all', adminController.getAdmins);
router.post('/create', adminController.createAdmin);
router.post('/delete/:id', adminController.deleteAdmin);

module.exports = router;
