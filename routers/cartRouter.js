const router = require('express').Router();
const { cartController } = require('../controllers');
const { verifyToken } = require('../configs/jwtuser');

router.post('/add', cartController.add);
router.get('/get/:id', verifyToken, cartController.getCart);
router.delete('/delete/:id', verifyToken, cartController.deleteCart);
router.patch('/update', verifyToken, cartController.updateCart);
router.patch('/checked', verifyToken, cartController.updateChecked);
router.patch('/checkedall', verifyToken, cartController.updateCheckedAll);

router.get('/user/:id', cartController.RSgetUserCartItems);
router.patch('/checked-all/:id', cartController.RScheckedAll);
router.patch('/checked-one/:id', cartController.RScheckedOne);
router.post('/destroy/:id', cartController.RSdelete);
router.patch('/quantity/:id', cartController.RSupdate);

module.exports = router;
