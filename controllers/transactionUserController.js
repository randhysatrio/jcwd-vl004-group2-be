const { Op } = require('sequelize');
const sequelize = require('../configs/sequelize');

const InvoiceHeader = require('../models/InvoiceHeader');
const InvoiceItem = require('../models/InvoiceItem');
const User = require('../models/User');
const Address = require('../models/Address');
const Product = require('../models/Product');
const Category = require('../models/Category');
const DeliveryOption = require('../models/DeliveryOption');

module.exports = {
  get: async (req, res) => {
    try {
      const { limit, page, status, dates } = req.body;

      const query = {
        where: {
          userId: req.user.id,
        },
        limit,
        offset: page * limit - limit,
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
          'createdAt',
          'status',
          [
            sequelize.literal(`(SELECT SUM(price * quantity) FROM invoiceitems WHERE invoiceitems.invoiceheaderId = invoiceheader.id)`),
            'total',
          ],
        ],
        include: [
          { model: User, attributes: ['phone_number'] },
          {
            model: InvoiceItem,
            include: [{ model: Product, include: Category, paranoid: false }],
          },
          { model: Address, paranoid: false },
          { model: DeliveryOption, attributes: ['name', 'cost'], paranoid: false },
        ],
      });

      res.status(200).send({ invoices: rows, count });
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

        res.status(200).send({ message: 'Thank you for letting us know you have received your order!', received: true });
      }
    } catch (error) {
      res.status(500).send(err);
    }
  },
};
