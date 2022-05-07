const router = require('express').Router();
const { auth } = require('../configs/jwtadmin');
const { reportController } = require('../controllers');

router.post('/get', auth, reportController.getReport);

module.exports = router;
