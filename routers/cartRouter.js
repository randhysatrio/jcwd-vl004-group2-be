const router = require('express').Router();
const { cartController } = require('../controllers');
const { verifyToken } = require('../configs/jwtuser');

router.post('/add', cartController.add);
router.get('/get/:id', verifyToken, cartController.getCart);
router.delete('/delete/:id', verifyToken, cartController.deleteCart);
router.patch('/update', verifyToken, cartController.updateCart);
router.patch('/checked', verifyToken, cartController.updateChecked);
router.patch('/checkedall', verifyToken, cartController.updateCheckedAll);

module.exports = router;
