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
      let search = req.query.search;
      let page = req.query.page ? req.query.page : 1;
      page = parseInt(page);
      let render = 5;
      let start = (page - 1) * render;
      let end = start + render;
      let startNumber = render * page - render;

      const count = await InvoiceHeader.count({
        where: {
          [Op.or]: {
            status: { [Op.like]: `%${search}%` },
            notes: { [Op.like]: `%${search}%` },
            '$user.name$': { [Op.like]: `%${search}%` },
            '$address.address$': { [Op.like]: `%${search}%` },
            '$deliveryoption.name$': { [Op.like]: `%${search}%` },
          },
        },
        include: [
          { model: User, required: true },
          { model: Address, required: true },
          { model: DeliveryOption, required: true },
        ],
      });

      const response = await InvoiceHeader.findAll({
        where: {
          [Op.or]: {
            status: { [Op.like]: `%${search}%` },
            notes: { [Op.like]: `%${search}%` },
            '$user.name$': { [Op.like]: `%${search}%` },
            '$address.address$': { [Op.like]: `%${search}%` },
            '$deliveryoption.name$': { [Op.like]: `%${search}%` },
          },
        },
        include: [
          { model: User, required: true },
          { model: Address, required: true },
          { model: DeliveryOption, required: true },
          { model: PaymentProof },
          { model: InvoiceItem, include: [Product] },
        ],
        offset: start,
        limit: end,
      });

      res.status(200).send({
        data: response,
        totalPage: Math.ceil(count / render),
        startNumber,
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
};