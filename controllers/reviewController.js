const Like = require('../models/Like');
const Review = require('../models/Review');

module.exports = {
  get: async (req, res) => {
    try {
      const { currentPage, limit } = req.body;

      const offset = currentPage * limit - limit;

      const { count, rows } = await Review.findAndCountAll({ where: { productId: req.params.id }, limit, offset, include: Like });

      const maxPage = Math.ceil(count / limit);

      res.status(200).send({ rows, maxPage });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  create: async (req, res) => {
    try {
      await Review.create(req.body);

      res.status(201).send('Review created successfully!');
    } catch (err) {
      res.status(500).send(err);
    }
  },
  like: async (req, res) => {
    try {
      const { userId, checked } = req.body;

      if (checked) {
        await Like.create({ reviewId: req.params.id, userId: req.body.userId });

        const totalLikes = await Like.count({ where: { reviewId: req.params.id } });

        res.status(201).send(totalLikes);
      } else {
        await Like.destroy({ reviewId: req.params.id, userId: req.body.userId });

        const totalLikes = await Like.count({ where: { reviewId: req.params.id } });

        res.status(200).send(totalLikes);
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
