const Review = require('../models/Review');
const Like = require('../models/Like');
const User = require('../models/User');
const sequelize = require('../configs/sequelize');

module.exports = {
  get: async (req, res) => {
    try {
      const { currentPage, limit } = req.body;

      const offset = currentPage * limit - limit;

      const { count, rows } = await Review.findAndCountAll({
        where: { productId: req.params.id },
        limit,
        offset,
        order: [['createdAt', 'desc']],
        include: [
          { model: User, attributes: ['name', 'profile_picture'] },
          { model: Like, attributes: ['userId'] },
        ],
        distinct: true,
      });

      const maxPage = Math.ceil(count / limit) || 1;

      res.status(200).send({ rows, maxPage, count });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  create: async (req, res) => {
    try {
      const { data, productId, limit } = req.body;

      await Review.create(data);

      const avgRating = await Review.findAll({
        where: { productId },
        attributes: [[sequelize.literal(`(SELECT AVG(reviews.rating) FROM reviews WHERE reviews.productId = ${productId})`), 'score']],
      });

      const { rows, count } = await Review.findAndCountAll({
        where: { productId },
        limit,
        include: [
          { model: User, attributes: ['name', 'profile_picture'] },
          { model: Like, attributes: ['userId'] },
        ],
        order: [['createdAt', 'desc']],
        distinct: true,
      });

      const maxPage = Math.ceil(count / limit) || 1;

      res.status(200).send({
        message: 'Review posted successfully!',
        totalReviews: count,
        rows,
        maxPage,
        avgRating: avgRating[0]?.getDataValue('score') || 0,
      });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  update: async (req, res) => {
    try {
      const { data, productId } = req.body;

      await Review.update(data, { where: { id: req.params.id } });

      const review = await Review.findOne({
        where: { id: req.params.id },
        include: [
          { model: User, attributes: ['name', 'profile_picture'] },
          { model: Like, attributes: ['userId'] },
        ],
      });

      const avgRating = await Review.findAll({
        where: { productId },
        attributes: [[sequelize.literal(`(SELECT AVG(reviews.rating) FROM reviews WHERE reviews.productId = ${productId})`), 'score']],
      });

      res.status(200).send({ message: 'Review updated successfully!', review, avgRating: avgRating[0]?.getDataValue('score') || 0 });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  delete: async (req, res) => {
    try {
      const { productId, limit, currentPage } = req.body;

      await Review.destroy({ where: { id: req.params.id } });

      const avgRating = await Review.findAll({
        where: { productId },
        attributes: [[sequelize.literal(`(SELECT AVG(reviews.rating) FROM reviews WHERE reviews.productId = ${productId})`), 'score']],
      });

      const { rows, count } = await Review.findAndCountAll({
        where: { productId },
        limit,
        offset: limit * currentPage - limit,
        include: [
          { model: User, attributes: ['name', 'profile_picture'] },
          { model: Like, attributes: ['userId'] },
        ],
        order: [['createdAt', 'desc']],
        distinct: true,
      });

      const maxPage = Math.ceil(count / limit) || 1;

      res.status(200).send({
        message: 'Review deleted successfully!',
        totalReviews: count,
        rows,
        maxPage,
        avgRating: avgRating[0]?.getDataValue('score') || 0,
      });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  like: async (req, res) => {
    try {
      const { userId, isLiked } = req.body;

      if (isLiked) {
        await Like.create({ reviewId: req.params.id, userId });

        const totalLikes = await Like.count({ where: { reviewId: req.params.id }, attributes: ['userId'] });

        res.status(201).send({ totalLikes });
      } else {
        await Like.destroy({ where: { reviewId: req.params.id, userId } });

        const totalLikes = await Like.count({ where: { reviewId: req.params.id }, attributes: ['userId'] });

        res.status(200).send({ totalLikes });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
