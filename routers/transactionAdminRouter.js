const router = require('express').Router();
const { transactionAdminController } = require('../controllers');
const { auth } = require('../configs/jwtadmin');

router.get('/get', auth, transactionAdminController.getTransaction);

module.exports = router;
