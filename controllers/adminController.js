const { Op } = require('sequelize');
const Crypto = require('crypto');

const Admin = require('../models/Admin');

module.exports = {
  getAdmins: async (req, res) => {
    try {
      if (!req.admin.is_super) {
        return res.status(409).send(`You don't have authorization to perform this action`);
      }

      const { limit, currentPage, sort } = req.body;

      const { keyword } = req.query;

      const query = {
        limit,
        offset: currentPage * limit - limit,
      };

      if (sort) {
        query.order = [sort.split(',')];
      }

      if (keyword) {
        query.where = {
          [Op.or]: {
            name: {
              [Op.substring]: keyword,
            },
            username: {
              [Op.substring]: keyword,
            },
            address: {
              [Op.substring]: keyword,
            },
          },
        };
      }

      const { rows, count } = await Admin.findAndCountAll(query);

      const maxPage = Math.ceil(count / limit) || 1;

      res.status(200).send({ rows, count, maxPage, totalAdmins: count });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  createAdmin: async (req, res) => {
    try {
      if (!req.admin.is_super) {
        return res.status(409).send(`You don't have authorization to perform this action`);
      }

      const { data, limit, currentPage } = req.body;

      data.password = Crypto.createHmac('sha1', 'hash123').update(data.password).digest('hex');

      const usernameCheck = await Admin.findOne({
        where: { username: data.username },
        paranoid: false,
      });
      const emailCheck = await Admin.findOne({ where: { email: data.email }, paranoid: false });

      if (usernameCheck) {
        res.send({ conflict: 'This username has already been used!' });
      } else if (emailCheck) {
        res.send({ conflict: 'This email has already been registered!' });
      } else {
        await Admin.create(data);

        const { rows, count } = await Admin.findAndCountAll({ limit, offset: currentPage * limit - limit });

        const maxPage = Math.ceil(count / limit) || 1;

        res.status(201).send({
          message: 'Admin account created successfully!',
          rows,
          maxPage,
          totalAdmins: count,
        });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
  deleteAdmin: async (req, res) => {
    try {
      if (!req.admin.is_super) {
        return res.status(409).send(`You don't have authorization to perform this action`);
      }

      const { limit, currentPage } = req.body;

      const admin = await Admin.findByPk(req.params.id, { attributes: ['is_super'] });

      if (admin.is_super) {
        return res.send({ conflict: true, message: 'This account cannot be deactivated!' });
      }

      await Admin.destroy({ where: { id: req.params.id } });

      const { rows, count } = await Admin.findAndCountAll({ limit, offset: currentPage * limit - limit });

      const maxPage = Math.ceil(count / limit) || 1;

      res.status(200).send({
        message: 'Account deactivated successfully!',
        rows,
        maxPage,
        totalAdmins: count,
      });
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
