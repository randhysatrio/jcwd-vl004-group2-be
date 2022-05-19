const router = require('express').Router();
const { transactionAdminController } = require('../controllers');
const { auth } = require('../configs/jwtadmin');

router.post('/get', auth, transactionAdminController.getTransaction);
router.patch('/approved/:id', auth, transactionAdminController.statusApproved);
router.patch('/rejected/:id', auth, transactionAdminController.statusRejected);

module.exports = router;
