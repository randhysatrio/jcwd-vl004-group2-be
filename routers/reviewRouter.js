const router = require('express').Router();
const { reviewController } = require('../controllers');

router.post('/create', reviewController.create);
router.post('/product/:id', reviewController.get);
router.post('/like/:id', reviewController.like);

module.exports = router;
