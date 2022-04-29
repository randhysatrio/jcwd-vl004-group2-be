const router = require('express').Router();
const { transactionUserController } = require('../controllers');
const { verifyToken } = require('../configs/jwtuser');

router.post('/user', verifyToken, transactionUserController.get);
router.patch('/received/:id', verifyToken, transactionUserController.received);

module.exports = router;
