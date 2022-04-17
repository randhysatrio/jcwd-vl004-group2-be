const router = require('express').Router();
const { productController } = require('../controllers');

router.post('/add', productController.add);
router.get('/all', productController.all);
router.get('/find/:id', productController.getProductById);
router.post('/query', productController.query);
router.get('/appearance', productController.appearance);
router.patch('/edit/:id', productController.edit);

module.exports = router;
