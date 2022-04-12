const router = require('express').Router();
const { deliveryOptionController } = require('../controllers');

router.post('/add', deliveryOptionController.add);
router.get('/all', deliveryOptionController.get);
router.delete('/delete/:id', deliveryOptionController.delete);

module.exports = router;
