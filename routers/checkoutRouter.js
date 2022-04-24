const router = require('express').Router();
const { checkoutController } = require('../controllers');
const { verifyToken } = require('../configs/jwtuser');

router.get('/delivery', checkoutController.getDelivery);
router.get('/phone/:id', verifyToken, checkoutController.getPhone);
router.patch('/phone/edit/:id', verifyToken, checkoutController.editPhone);
router.post('/add-address', verifyToken, checkoutController.addAddress);
router.patch('/select-address', verifyToken, checkoutController.selectAddress);
router.post('/add', verifyToken, checkoutController.addCheckout);
router.post('/proof', verifyToken, checkoutController.addProof);

module.exports = router;
