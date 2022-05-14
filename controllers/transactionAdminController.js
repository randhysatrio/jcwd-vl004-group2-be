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
      const { sort, startDate, endDate, search, page } = req.body;
      const limit = 5;
      const offset = (page - 1) * limit;

      const query = { order: [['createdAt', 'DESC']], limit, offset };

      if (sort) {
        query.order = [sort.split(',')];
      }

      if (startDate || endDate) {
        query.where = {
          ...query.where,
          createdAt: {
            [Op.between]: [startOfDay(new Date(startDate)), endOfDay(new Date(endDate))],
          },
        };
      }

      if (search) {
        query.where = {
          ...query.where,
          [Op.or]: {
            status: { [Op.substring]: search },
            notes: { [Op.substring]: search },
            '$user.name$': { [Op.substring]: search },
            '$address.address$': { [Op.substring]: search },
            '$deliveryoption.name$': { [Op.substring]: search },
          },
        };
      }

      const { rows, count } = await InvoiceHeader.findAndCountAll({
        ...query,
        include: [
          { model: User, attributes: ['name'], required: true },
          { model: Address, attributes: ['address', 'city', 'province', 'country', 'postalcode'], required: true, paranoid: false },
          { model: DeliveryOption, attributes: ['name'], required: true, paranoid: false },
          { model: PaymentProof },
          {
            model: InvoiceItem,
            attributes: ['price', 'quantity'],
            include: [{ model: Product, attributes: ['name', 'image'], paranoid: false }],
          },
        ],
        distinct: true,
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
              filename: `${transaction.user.name.replace(' ', '')}_invoice_${transaction.id}.pdf`,
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
              filename: `${transaction.user.name.replace(' ', '')}_invoice_${transaction.id}.pdf`,
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
