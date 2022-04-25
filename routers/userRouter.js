const router = require('express').Router();
const { userController } = require('../controllers');
const { verifyToken } = require('../configs/jwtuser');
const { profileUploader } = require('../configs/uploader');

router.get('/all', userController.get);
router.patch('/status/:id', userController.status);
router.post('/query', userController.query);
router.get('/find-user', verifyToken, userController.findById);
router.post('/update-profile', verifyToken, profileUploader().single('profile_picture'), userController.updateProfile);
router.post('/update-password', verifyToken, userController.updatePassword);

module.exports = router;
