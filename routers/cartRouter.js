const routers = require('express').Router();
const { cartController } = require('../controllers');
const { verifyToken } = require('../configs/jwtuser');

router.post('/add', cartController.add);
routers.get('/get/:id', verifyToken, cartController.getCart);
routers.delete('/delete/:id', verifyToken, cartController.deleteCart);
routers.patch('/update', verifyToken, cartController.updateCart);
routers.patch('/checked', verifyToken, cartController.updateChecked);
routers.patch('/checkedall', verifyToken, cartController.updateCheckedAll);

module.exports = routers;
