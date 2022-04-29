const Address = require('../models/Address');

module.exports = {
  add: async (req, res) => {
    try {
      const { address, city, province, country, postalcode, is_default } = req.body;

      const currentDefault = await Address.findOne({ where: { is_default: true, userId: req.user.id } });

      if (is_default && currentDefault) {
        currentDefault.is_default = false;

        await currentDefault.save();
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
      });

      rows.sort((a, b) => {
        if (a.is_default === true) {
          return -1;
        }
      });

      res.status(200).send({ message: 'Address created successfully!', rows, count });
    } catch (err) {
      console.log(err);
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
      });

      rows.sort((a, b) => {
        if (a.is_default === true) {
          return -1;
        }
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
      });

      rows.sort((a, b) => {
        if (a.is_default === true) {
          return -1;
        }
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
      });

      rows.sort((a, b) => {
        if (a.is_default === true) {
          return -1;
        }
      });

      res.status(200).send({ rows, count });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  edit: async (req, res) => {
    try {
      const { limit, currentPage } = req.body;

      if (req.body.values.is_default) {
        await Address.update({ is_default: false }, { where: { userId: req.user.id } });
      }

      await Address.update(req.body.values, { where: { id: req.params.id } });

      const { rows, count } = await Address.findAndCountAll({
        where: { userId: req.user.id },
        limit,
        offset: limit * currentPage - limit,
      });

      rows.sort((a, b) => {
        if (a.is_default === true) {
          return -1;
        }
      });

      res.status(200).send({ message: 'Address updated successfully!', rows, count });
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
};
