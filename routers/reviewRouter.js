const router = require('express').Router();
const { reviewController } = require('../controllers');

router.post('/create', reviewController.create);
router.post('/product/:id', reviewController.get);
router.patch('/edit/:id', reviewController.update);
router.post('/like/:id', reviewController.like);
router.post('/delete/:id', reviewController.delete);

module.exports = router;
