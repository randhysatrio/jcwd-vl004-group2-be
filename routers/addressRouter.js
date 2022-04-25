const { addressController } = require('../controllers');
const router = require('express').Router();
const { verifyToken } = require('../configs/jwtuser');

router.post('/add', verifyToken, addressController.add);
router.patch('/update/:id', verifyToken, addressController.update);
router.patch('/edit/:id', verifyToken, addressController.edit);
router.get('/find', verifyToken, addressController.get);
router.delete('/delete/:id', verifyToken, addressController.delete);

module.exports = router;
