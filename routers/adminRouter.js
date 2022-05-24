const router = require('express').Router();
const { adminController } = require('../controllers');
const { auth } = require('../configs/jwtadmin');

router.post('/all', auth, adminController.getAdmins);
router.post('/create', auth, adminController.createAdmin);
router.post('/delete/:id', auth, adminController.deleteAdmin);

module.exports = router;
