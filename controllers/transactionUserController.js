const InvoiceHeader = require('../models/InvoiceHeader');
const InvoiceItem = require('../models/InvoiceItem');
const Product = require('../models/Product');
const Address = require('../models/Address');
const DeliveryOption = require('../models/DeliveryOption');
const { Op } = require('sequelize');
const User = require('../models/User');
const Category = require('../models/Category');
const sequelize = require('../configs/sequelize');

module.exports = {
  get: async (req, res) => {
    try {
      const { limit, page, status, dates } = req.body;

      const query = {
        where: {
          userId: req.params.id,
        },
        limit,
        offset: page * limit - limit,
      };

      if (status) {
        query.where = { ...query.where, status };
      }

      if (dates) {
        const { count, rows } = await InvoiceHeader.findAndCountAll(
          {
            ...query,
            attributes: [
              'id',
              'notes',
              'is_received',
              'createdAt',
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
          },
          {
            createdAt: {
              [Op.gte]: dates.gte,
              [Op.lte]: dates.lte,
            },
          }
        );

        res.status(200).send({ invoices: rows, count });
      } else {
        const { count, rows } = await InvoiceHeader.findAndCountAll({
          ...query,
          attributes: [
            'id',
            'notes',
            'is_received',
            'createdAt',
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
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
  received: async (req, res) => {
    try {
      await InvoiceHeader.update({ is_received: true }, { where: { id: req.params.id } });

      res.status(200).send({ message: 'Thank you for letting us know you have received your order!', received: true });
    } catch (error) {
      res.status(500).send(err);
    }
  },
};
