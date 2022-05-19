const router = require('express').Router();
const { checkoutController } = require('../controllers');
const { verifyToken } = require('../configs/jwtuser');

router.patch('/phone/edit/:id', verifyToken, checkoutController.editPhone);
router.post('/add-address', verifyToken, checkoutController.addAddress);
router.post('/add', verifyToken, checkoutController.addCheckout);
router.post('/proof', verifyToken, checkoutController.addProof);
router.post('/cancel/:id', verifyToken, checkoutController.cancelCheckout);
router.get('/awaiting/:id', verifyToken, checkoutController.getAwaiting);
router.get('/checkoutoptions', verifyToken, checkoutController.getCheckoutOptions);

module.exports = router;
