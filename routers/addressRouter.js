const { addressController } = require('../controllers');
const router = require('express').Router();

router.post('/add', addressController.add);
router.get('/find/:id', addressController.get);
router.delete('/delete/:id', addressController.delete);

module.exports = router;
