const router = require('express').Router();
const { productController } = require('../controllers');

router.post('/add', productController.add);
router.get('/all', productController.all);
router.post('/query', productController.query);
router.get('/appearance', productController.appearence);

module.exports = router;
