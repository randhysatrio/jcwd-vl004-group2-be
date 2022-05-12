const { Op } = require('sequelize');
const InvoiceHeader = require('../models/InvoiceHeader');
const InvoiceItem = require('../models/InvoiceItem');
const User = require('../models/User');
const Address = require('../models/Address');
const Product = require('../models/Product');
const DeliveryOption = require('../models/DeliveryOption');
const PaymentProof = require('../models/PaymentProof');

module.exports = {
  getTransaction: async (req, res) => {
    try {
      // sort and { sort } is different
      let { sort, startDate, endDate } = req.body;
      let search = req.body.search ? req.body.search : '';
      let page = req.body.page ? parseInt(req.body.page) : 1;
      let render = 5;
      let start = (page - 1) * render;
      let startNumber = render * page - render;

      const query = {
        render,
      };

      if (sort) {
        query.order = [sort.split(',')];
      } else {
        query.order = [['createdAt', 'DESC']];
      }

      // date settings
      let fullDate = new Date();
      let date = `0${fullDate.getDate()}`;
      let month = `0${fullDate.getMonth() + 1}`;
      let year = fullDate.getFullYear();

      // date;
      startDate = startDate
        ? new Date(startDate)
        : new Date(`${year}-${month}-01`);
      startDate.setUTCHours(0, 0, 0, 0);

      endDate = endDate
        ? new Date(endDate)
        : new Date(`${year}-${month}-${date}`);
      endDate.setUTCHours(23, 59, 59, 999);

      const { count, rows } = await InvoiceHeader.findAndCountAll({
        ...query,
        where: {
          [Op.or]: {
            status: { [Op.like]: `%${search}%` },
            notes: { [Op.like]: `%${search}%` },
            '$user.name$': { [Op.like]: `%${search}%` },
            '$address.address$': { [Op.like]: `%${search}%` },
            '$deliveryoption.name$': { [Op.like]: `%${search}%` },
          },
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          { model: User, required: true },
          { model: Address, required: true },
          { model: DeliveryOption, required: true },
          { model: PaymentProof },
          { model: InvoiceItem, include: [Product] },
        ],
        distinct: true,
        offset: start,
        limit: render,
      });

      res.status(200).send({
        data: rows,
        totalPage: Math.ceil(count / render),
        startNumber,
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  statusApproved: async (req, res) => {
    try {
      const transaction = await InvoiceHeader.findByPk(req.params.id);
      if (transaction.status === 'pending') {
        await InvoiceHeader.update(
          {
            status: 'approved',
          },
          {
            where: { id: req.params.id },
          }
        );
      }
      res.status(200).send(transaction);
    } catch (error) {
      res.status(500).send(error);
    }
  },
  statusRejected: async (req, res) => {
    try {
      const transaction = await InvoiceHeader.findByPk(req.params.id);
      if (transaction.status === 'pending') {
        await InvoiceHeader.update(
          {
            status: 'rejected',
          },
          {
            where: { id: req.params.id },
          }
        );
      }
      res.status(200).send(transaction);
    } catch (error) {
      res.status(500).send(error);
    }
  },
};
