const { Op } = require('sequelize');
const Admin = require('../models/Admin');
const Message = require('../models/Message');
const User = require('../models/User');

module.exports = {
  getUserMsg: async (req, res) => {
    try {
      const { limit, currentPage, keyword } = req.body;

      let where = { userId: req.params.id, to: 'user' };

      if (keyword) {
        where = {
          ...where,
          [Op.or]: {
            header: { [Op.substring]: keyword },
            adminId: { [Op.substring]: keyword },
            '$admin.name$': { [Op.substring]: keyword },
          },
        };
      }

      const { count, rows } = await Message.findAndCountAll({
        where,
        limit,
        offset: currentPage * limit - limit,
        order: [['createdAt', 'desc']],
        include: [{ model: Admin, attributes: ['name'], paranoid: false }],
      });

      res.status(200).send({ count, maxPage: Math.ceil(count / limit) || 1, rows });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  getAdminMsg: async (req, res) => {
    try {
      const { limit, currentPage, keyword } = req.body;

      let where = { to: 'admin' };

      if (keyword) {
        where = {
          ...where,
          [Op.or]: {
            header: { [Op.substring]: keyword },
            userId: { [Op.substring]: keyword },
            '$user.name$': { [Op.substring]: keyword },
          },
        };
      }

      const { count, rows } = await Message.findAndCountAll({
        where,
        limit,
        offset: currentPage * limit - limit,
        order: [['createdAt', 'desc']],
        include: [{ model: User, attributes: ['id', 'name'] }],
      });

      res.status(200).send({ count, maxPage: Math.ceil(count / limit) || 1, rows });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  read: async (req, res) => {
    try {
      await Message.update({ is_new: false, is_read: true }, { where: { id: req.params.id } });

      res.status(200).send('Message updated successfully!');
    } catch (err) {
      res.status(500).send(err);
    }
  },
  unnew: async (req, res) => {
    try {
      await Message.update({ is_new: false }, { where: { userId: req.params.id, is_new: true } });

      res.status(200).send('Messages updated successfully!');
    } catch (err) {
      res.status(500).send(err);
    }
  },
  unnewAdmin: async (req, res) => {
    try {
      await Message.update({ is_new: false }, { where: { to: 'admin' } });

      res.status(200).send('Messages updated successfully!');
    } catch (err) {
      res.status(500).send(err);
    }
  },
  deleteUserMsg: async (req, res) => {
    try {
      const { userId, limit, currentPage } = req.body;

      await Message.destroy({ where: { id: req.params.id } });

      const { count, rows } = await Message.findAndCountAll({
        where: { userId, to: 'user' },
        limit,
        offset: currentPage * limit - limit,
        order: [['createdAt', 'desc']],
        include: [{ model: Admin, attributes: ['name'], paranoid: false }],
      });

      res.status(200).send({ message: 'Message deleted successfully!', maxPage: Math.ceil(count / limit) || 1, rows, count });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  deleteAdminMsg: async (req, res) => {
    try {
      const { limit, currentPage } = req.body;

      await Message.destroy({ where: { id: req.params.id } });

      const { count, rows } = await Message.findAndCountAll({
        where: { to: 'admin' },
        limit,
        offset: currentPage * limit - limit,
        order: [['createdAt', 'desc']],
        include: [{ model: User, attributes: ['id', 'name'] }],
      });

      res.status(200).send({ message: 'Message deleted successfully!', maxPage: Math.ceil(count / limit) || 1, rows, count });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  create: async (req, res) => {
    try {
      await Message.create(req.body);

      res.status(201).send('Message created successfully!');
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
