const router = require('express').Router();
const { cartController } = require('../controllers');

router.post('/add', cartController.add);

module.exports = router;
