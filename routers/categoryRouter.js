const { categoryController } = require('../controllers');
const router = require('express').Router();

router.post('/add', categoryController.add);
router.get('/all', categoryController.get);
router.delete('/delete/:id', categoryController.delete);

module.exports = router;
