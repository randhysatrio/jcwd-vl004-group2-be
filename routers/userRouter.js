const router = require('express').Router();
const { userController } = require('../controllers');
const { verifyToken } = require('../configs/jwtuser');

router.get('/all', userController.get);
router.patch('/status/:id', userController.status);
router.post('/query', userController.query);
router.get('/find-user', verifyToken, userController.findById);

module.exports = router;
