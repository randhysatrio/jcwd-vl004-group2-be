const Address = require('../models/Address');

module.exports = {
  add: async (req, res) => {
    try {
      const { limit, data, currentPage } = req.body;

      if (data.is_default) {
        await Address.update({ is_default: false }, { where: { userId: req.user.id } });
      }

      await Address.create({ ...data, userId: req.user.id });

      const { rows, count } = await Address.findAndCountAll({
        where: { userId: req.user.id },
        limit,
        offset: currentPage * limit - limit,
        order: [['is_default', 'desc']],
      });

      res.status(200).send({
        message: 'Address created successfully!',
        rows,
        maxPage: Math.ceil(count / limit) || 1,
        count,
      });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  get: async (req, res) => {
    try {
      const { limit, currentPage } = req.body;

      const { rows, count } = await Address.findAndCountAll({
        where: { userId: req.user.id },
        limit,
        offset: limit * currentPage - limit,
        order: [['is_default', 'desc']],
      });

      res.status(200).send({ rows, maxPage: Math.ceil(count / limit) || 1, count });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  delete: async (req, res) => {
    try {
      const { limit, currentPage } = req.body;

      await Address.destroy({ where: { id: req.params.id } });

      const { rows, count } = await Address.findAndCountAll({
        where: { userId: req.user.id },
        limit,
        offset: limit * currentPage - limit,
        order: [['is_default', 'desc']],
      });

      res.status(200).send({ message: 'Address deleted successfully!', rows, maxPage: Math.ceil(count / limit) || 1, count });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  default: async (req, res) => {
    try {
      const { limit, currentPage } = req.body;

      await Address.update({ is_default: false }, { where: { userid: req.user.id } });

      await Address.update({ is_default: true }, { where: { id: req.params.id } });

      const { rows, count } = await Address.findAndCountAll({
        where: { userId: req.user.id },
        limit,
        offset: limit * currentPage - limit,
        order: [['is_default', 'desc']],
      });

      res.status(200).send({ rows, maxPage: Math.ceil(count / limit) || 1, count });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  edit: async (req, res) => {
    try {
      const { values } = req.body;

      await Address.update(values, { where: { id: req.params.id } });

      res.status(200).send({ message: 'Address updated successfully!' });
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
