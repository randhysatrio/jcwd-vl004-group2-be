const Address = require('../models/Address');

module.exports = {
  add: async (req, res) => {
    try {
      const { address, city, province, country, postalcode, is_default } = req.body;

      if (is_default) {
        await Address.update({ is_default: false }, { where: { userId: req.user.id } });
      }

      await Address.create({
        address,
        city,
        province,
        country,
        postalcode,
        userId: req.user.id,
        is_default,
      });

      const { rows, count } = await Address.findAndCountAll({
        where: { userId: req.user.id },
        limit: 10,
        offset: 0,
        order: [['is_default', 'desc']],
      });

      res.status(200).send({ message: 'Address created successfully!', rows, count });
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

      res.status(200).send({ rows, count });
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

      res.status(200).send({ message: 'Address deleted successfully!', rows, count });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  update: async (req, res) => {
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

      res.status(200).send({ rows, count });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  edit: async (req, res) => {
    try {
      const { limit, currentPage, values } = req.body;

      if (values.is_default) {
        await Address.update({ is_default: false }, { where: { userId: req.user.id } });
      }

      await Address.update(values, { where: { id: req.params.id } });

      const { rows, count } = await Address.findAndCountAll({
        where: { userId: req.user.id },
        limit,
        offset: limit * currentPage - limit,
        order: [['is_default', 'desc']],
      });

      res.status(200).send({ message: 'Address updated successfully!', rows, count });
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
