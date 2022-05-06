const { Op } = require('sequelize');
const Crypto = require('crypto');

const Admin = require('../models/Admin');

module.exports = {
  getAdmins: async (req, res) => {
    try {
      const { limit, currentPage, sort, keyword } = req.body;

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

      const maxPage = Math.ceil(count / limit);

      res.status(200).send({ rows, count, maxPage });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  createAdmin: async (req, res) => {
    try {
      req.body.password = Crypto.createHmac('sha1', 'hash123').update(req.body.password).digest('hex');

      const usernameCheck = await Admin.findOne({ where: { username: req.body.username } });
      const emailCheck = await Admin.findOne({ where: { email: req.body.email } });

      if (usernameCheck) {
        res.send({ conflict: 'This username has already been used!' });
      } else if (emailCheck) {
        res.send({ conflict: 'This username has already been used!' });
      } else {
        await Admin.create(req.body);

        res.status(201).send('Admin Account created successfully!');
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
