const router = require('express').Router();
const { authAdminControllers } = require('../controllers');
const { auth } = require('../configs/jwtadmin');

router.post('/login', authAdminControllers.loginAdmin);
router.post('/reset', authAdminControllers.reqResetPassword);
router.patch('/change-password', auth, authAdminControllers.changePassword);
router.post('/get', auth, authAdminControllers.getAdmin);
router.post('/create', authAdminControllers.createAdmin);

module.exports = router;
