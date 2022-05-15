const { Op } = require('sequelize');
const sequelize = require('../configs/sequelize');
const path = require('path');

const InvoiceHeader = require('../models/InvoiceHeader');
const InvoiceItem = require('../models/InvoiceItem');
const User = require('../models/User');
const Address = require('../models/Address');
const Product = require('../models/Product');
const Category = require('../models/Category');
const DeliveryOption = require('../models/DeliveryOption');
const Message = require('../models/Message');

module.exports = {
  get: async (req, res) => {
    try {
      const { limit, currentPage, status, dates } = req.body;

      const query = {
        where: {
          userId: req.user.id,
          status: ['pending', 'approved', 'rejected'],
        },
        limit,
        offset: currentPage * limit - limit,
      };

      if (status) {
        query.where = { ...query.where, status };
      }

      if (dates) {
        query.where = {
          ...query.where,
          createdAt: {
            [Op.lt]: dates.lte,
            [Op.gt]: dates.gte,
          },
        };
      }

      const { count, rows } = await InvoiceHeader.findAndCountAll({
        ...query,
        attributes: [
          'id',
          'notes',
          'is_received',
          'invoice_path',
          'createdAt',
          'status',
          [
            sequelize.literal(`(SELECT SUM(price * quantity) FROM invoiceitems WHERE invoiceitems.invoiceheaderId = invoiceheader.id)`),
            'total',
          ],
        ],
        include: [
          {
            model: InvoiceItem,
            attributes: ['price', 'quantity', 'subtotal'],
            include: [
              {
                model: Product,
                include: [{ model: Category, attributes: ['name'] }],
                attributes: ['name', 'image', 'unit', 'id'],
                paranoid: false,
              },
            ],
          },
          { model: User, attributes: ['name', 'phone_number'] },
          { model: Address, attributes: ['address', 'city', 'province', 'country', 'postalcode'], paranoid: false },
          { model: DeliveryOption, attributes: ['name', 'cost'], paranoid: false },
        ],
        order: [['createdAt', 'desc']],
        distinct: true,
      });

      res.status(200).send({ invoices: rows, maxPage: Math.ceil(count / limit) || 1, count });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  received: async (req, res) => {
    try {
      const invoiceData = await InvoiceHeader.findOne({ where: { id: req.params.id, userId: req.user.id } });

      if (invoiceData.status !== 'approved') {
        res.send({ conflict: true, message: 'Please wait until this invoice is approved!' });
      } else if (invoiceData.is_received === true) {
        res.send({ conflict: true, message: 'You already received this order' });
      } else {
        await InvoiceHeader.update({ is_received: true }, { where: { id: req.params.id, userId: req.user.id } });

        await Message.create({
          userId: req.user.id,
          to: 'admin',
          header: `Invoice #${req.params.id} has reached their destination`,
          content: `User ID #${req.user.id} (${req.user.name}) has informed us that Invoice ID#${req.params.id} has been successfully received by this user.|Thank you and have a nice day :)|**This is an automated message**`,
        });

        res.status(200).send({ message: 'Thank you for letting us know you have received your order!', received: true });
      }
    } catch (error) {
      res.status(500).send(err);
    }
  },
  renderInvoice: async (req, res) => {
    try {
      const invoiceId = req.params.id;

      const data = await InvoiceHeader.findOne({
        where: { id: invoiceId },
        attributes: [
          'id',
          'notes',
          'status',
          'createdAt',
          [
            sequelize.literal(`(SELECT SUM(price * quantity) FROM invoiceitems WHERE invoiceitems.invoiceheaderId = invoiceheader.id)`),
            'total',
          ],
        ],
        include: [
          {
            model: InvoiceItem,
            attributes: ['id', 'price', 'quantity', 'subtotal'],
            include: [{ model: Product, attributes: ['name', 'image', 'unit'], paranoid: false }],
          },
          { model: User, attributes: ['name', 'phone_number'] },
          { model: Address, attributes: ['address', 'city', 'province', 'country', 'postalcode'], paranoid: false },
          { model: DeliveryOption, attributes: ['name', 'cost'], paranoid: false },
        ],
      });

      res.render('invoice', { data: data.toJSON() });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  downloadInvoice: async (req, res) => {
    try {
      const { path } = req.query;

      res.download(path);
    } catch (err) {
      res.status(500).send(err);
    }
  },
  getAwaiting: async (req, res) => {
    try {
      const { limit, currentPage } = req.body;

      const { rows, count } = await InvoiceHeader.findAndCountAll({
        where: { userId: req.user.id, status: 'awaiting' },
        attributes: [
          'id',
          'createdAt',
          [
            sequelize.literal(`(SELECT SUM(price * quantity) FROM invoiceitems WHERE invoiceitems.invoiceheaderId = invoiceheader.id)`),
            'total',
          ],
        ],
        include: [
          {
            model: InvoiceItem,
            attributes: ['id', 'price', 'quantity', 'subtotal'],
            include: [{ model: Product, attributes: ['name', 'image', 'unit'], paranoid: false }],
          },
          { model: DeliveryOption, attributes: ['name', 'cost'], paranoid: false },
        ],
        limit,
        offset: limit * currentPage - limit,
      });

      res.status(200).send({ rows, count, maxPage: Math.ceil(count / limit) || 1 });
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
