const Product = require('../models/Product');
const User = require('../models/User');
const { Op } = require('sequelize');

module.exports = {
  get: async (req, res) => {
    try {
      const users = await User.findAll({});

      res.status(200).send(users);
    } catch (err) {
      res.status(500).send(err);
    }
  },
  status: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (user.active === true) {
        await User.update(
          {
            active: false,
          },
          {
            where: { id: req.params.id },
          }
        );
      } else {
        await User.update(
          {
            active: true,
          },
          {
            where: { id: req.params.id },
          }
        );
      }
      res.status(200).send(user);
    } catch (error) {
      res.status(500).send(error);
    }
  },
  delete: async (req, res) => {
    try {
      await Address.destroy({ where: { id: req.params.id } });

      res.status(200).send('Address deleted successfully!');
    } catch (err) {
      res.status(200).send(err);
    }
  },
  query: async (req, res) => {
    try {
      console.log('test');
      const { name, active, limit } = req.body;

      const query = {
        limit,
      };

      if (name) {
        query.where = { ...query.where, name: { [Op.substring]: name } };
      }

      if (active) {
        query.where = { ...query.where, active: active };
      }

      const { count, rows } = await User.findAndCountAll({ ...query });

      res.status(200).send({ users: rows, length: count });
    } catch (err) {
      // console.log(err) to inform the error in the console
      console.log(err);
      res.status(500).send(err);
    }
  },
  findById: async (req, res) => {
    try {
      const { id } = req.user;

      const user = await User.findByPk(id);

      res.status(200).send(user);
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
