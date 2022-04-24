const routers = require('express').Router();
const { checkoutController } = require('../controllers');
const { verifyToken } = require('../configs/jwtuser');

routers.get('/delivery', checkoutController.getDelivery);
routers.get('/phone/:id', verifyToken, checkoutController.getPhone);
routers.patch('/phone/edit/:id', verifyToken, checkoutController.editPhone);
routers.post('/add-address', verifyToken, checkoutController.addAddress);
routers.patch('/select-address', verifyToken, checkoutController.selectAddress);
routers.post('/add', verifyToken, checkoutController.addCheckout);
routers.post('/proof', verifyToken, checkoutController.addProof);

module.exports = routers;
