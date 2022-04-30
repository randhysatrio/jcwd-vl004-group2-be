const router = require('express').Router();
const { transactionUserController } = require('../controllers');
const { invoiceItemController } = require('../controllers');
const { verifyToken } = require('../configs/jwtuser');

router.post('/user', verifyToken, transactionUserController.get);
router.patch('/received/:id', verifyToken, transactionUserController.received);
router.get('/repeat/:id', invoiceItemController.repeat);

module.exports = router;
