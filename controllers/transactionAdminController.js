const { Op } = require('sequelize');
const InvoiceHeader = require('../models/InvoiceHeader');
const InvoiceItem = require('../models/InvoiceItem');
const User = require('../models/User');
const Address = require('../models/Address');
const Product = require('../models/Product');
const DeliveryOption = require('../models/DeliveryOption');
const PaymentProof = require('../models/PaymentProof');
const Message = require('../models/Message');

const { startOfDay, endOfDay } = require('date-fns');
const transporter = require('../configs/nodemailer');
const { generatePdf } = require('../configs/puppeteer');
const path = require('path');

module.exports = {
  getTransaction: async (req, res) => {
    try {
      // sort and { sort } is different
      let { sort, startDate, endDate } = req.body;
      let search = req.body.search ? req.body.search : '';
      let page = req.body.page ? parseInt(req.body.page) : 1;
      let limit = 5;
      let offset = (page - 1) * limit;
      // let startNumber = render * page - render;

      const query = {};

      if (sort) {
        query.order = [sort.split(',')];
      } else {
        query.order = [['createdAt', 'DESC']];
      }

      // date settings
      // let fullDate = new Date();
      // let date = `0${fullDate.getDate()}`;
      // let month = `0${fullDate.getMonth() + 1}`;
      // let year = fullDate.getFullYear();

      // // date;
      // startDate = startDate ? new Date(startDate) : new Date(`${year}-${month}-01`);
      // startDate.setUTCHours(0, 0, 0, 0);

      // endDate = endDate ? new Date(endDate) : new Date(`${year}-${month}-${date}`);
      // endDate.setUTCHours(23, 59, 59, 999);

      // const count = await InvoiceHeader.count({
      //   where: {
      //     [Op.or]: {
      //       status: { [Op.like]: `%${search}%` },
      //       notes: { [Op.like]: `%${search}%` },
      //       '$user.name$': { [Op.like]: `%${search}%` },
      //       '$address.address$': { [Op.like]: `%${search}%` },
      //       '$deliveryoption.name$': { [Op.like]: `%${search}%` },
      //     },
      //   },
      //   include: [
      //     { model: User, required: true },
      //     { model: Address, required: true },
      //     { model: DeliveryOption, required: true },
      //   ],
      // });

      const { rows, count } = await InvoiceHeader.findAndCountAll({
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
            [Op.between]: [startOfDay(new Date(startDate)), endOfDay(new Date(endDate))],
          },
        },
        include: [
          { model: User, required: true },
          { model: Address, required: true },
          { model: DeliveryOption, required: true },
          { model: PaymentProof },
          { model: InvoiceItem, include: [Product] },
        ],
        offset,
        limit,
      });

      res.status(200).send({
        data: rows,
        totalPage: Math.ceil(count / limit) || 1,
        startNumber: offset,
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  statusApproved: async (req, res) => {
    try {
      const { id } = req.admin;

      const transaction = await InvoiceHeader.findByPk(req.params.id, {
        include: [
          {
            model: InvoiceItem,
            attributes: ['price', 'quantity', 'subtotal'],
            include: [{ model: Product, attributes: ['name', 'image', 'unit'], paranoid: false }],
          },
          { model: User, attributes: ['name', 'email', 'phone_number'] },
          { model: Address, attributes: ['address', 'city', 'province', 'country', 'postalcode'], paranoid: false },
          { model: DeliveryOption, attributes: ['name', 'cost'], paranoid: false },
        ],
      });

      if (transaction.status === 'pending') {
        await InvoiceHeader.update(
          {
            status: 'approved',
          },
          {
            where: { id: req.params.id },
          }
        );

        await Message.create({
          userId: transaction.userId,
          to: 'user',
          adminId: id,
          header: `Payment Approved for Invoice #${transaction.id}`,
          content: `Hello, ${transaction.user.name}!|We have approved the payment you've made for Invoice #${transaction.id}!|Please wait while we packed your order and shipped it to you immediately!|Thank you for shopping with us and we are looking forward for your next order :)|Regards,`,
        });

        const invoicePdfPath = await generatePdf(transaction);

        transaction.invoice_path = invoicePdfPath;

        await transaction.save();

        await transporter.sendMail({
          from: 'HeizenbergAdmin <admin@heizenbergco.com>',
          to: `${transaction.user.email}`,
          subject: `Payment Approved for Invoice #${transaction.id}`,
          html: `
          <p>Dear, ${transaction.user.name}</p>
          <br/>
          <p>We are glad to inform you that we have approved the payment you've made for Invoice #${transaction.id}!</p>
          <P>Please kindly wait while we get your order ready and shipped it to you immediately!</p>
          <p>Regards, </p>
          <p><b>The Heizen Berg Co. Admin Team</b></p>`,
          attachments: [
            {
              filename: `${transaction.user.name}_invoice_${transaction.id}.pdf`,
              path: path.resolve(invoicePdfPath),
              contentType: 'application/pdf',
            },
          ],
        });

        res.status(200).send({
          message: 'Invoice updated successfully!',
          userId: transaction.userId,
        });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  },
  statusRejected: async (req, res) => {
    try {
      const { id } = req.admin;

      const transaction = await InvoiceHeader.findByPk(req.params.id, {
        include: [
          {
            model: InvoiceItem,
            attributes: ['price', 'quantity', 'subtotal'],
            include: [{ model: Product, attributes: ['name', 'image', 'unit'], paranoid: false }],
          },
          { model: User, attributes: ['name', 'email', 'phone_number'] },
          { model: Address, attributes: ['address', 'city', 'province', 'country', 'postalcode'], paranoid: false },
          { model: DeliveryOption, attributes: ['name', 'cost'], paranoid: false },
        ],
      });

      if (transaction.status === 'pending') {
        await InvoiceHeader.update(
          {
            status: 'rejected',
          },
          {
            where: { id: req.params.id },
          }
        );

        await Message.create({
          userId: transaction.userId,
          to: 'user',
          adminId: id,
          header: `Payment Rejected for Invoice #${transaction.id}`,
          content: `Hello, ${transaction.user.name}!|We're sorry to inform you that we have rejected the payment you've made for Invoice #${transaction.id}.|Furthermore, in line with our applied terms and conditions, you will received your money back in 1x24h time. If you have any questions just send us an email at admin@heizenbergco.com|Regards,`,
        });

        const invoicePdfPath = await generatePdf(transaction);

        await transporter.sendMail({
          from: 'HeizenbergAdmin <admin@heizenbergco.com>',
          to: `${transaction.user.email}`,
          subject: `Payment Rejected for Invoice #${transaction.id}`,
          html: `
          <p>Dear, ${transaction.user.name}</p>
          <br/>
          <p>We're sorry to inform you that we have rejected the payment you've made for Invoice #${transaction.id}.</p>
          <P>Furthermore, in line with our applied terms and conditions, you will received your money back in 1x24h time.</p>
          <p>If you have any questions just send us an email at admin@heizenbergco.com</p>
          <p>Regards, </p>
          <p><b>The Heizen Berg Co. Admin Team</b></p>`,
          attachments: [
            {
              filename: `${transaction.user.name}_invoice_${transaction.id}.pdf`,
              path: path.resolve(invoicePdfPath),
              contentType: 'application/pdf',
            },
          ],
        });

        transaction.invoice_path = invoicePdfPath;

        await transaction.save();

        res.status(200).send({
          message: 'Invoice updated successfully!',
          userId: transaction.userId,
        });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  },
};
