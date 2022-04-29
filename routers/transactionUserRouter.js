const { transactionUserController } = require('../controllers');
const router = require('express').Router();

router.post('/user/:id', transactionUserController.get);
router.patch('/received/:id', transactionUserController.received);

module.exports = router;
