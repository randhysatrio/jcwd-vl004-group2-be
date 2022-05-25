const sequelize = require('../configs/sequelize');
const InvoiceHeader = require('../models/InvoiceHeader');
const InvoiceItem = require('../models/InvoiceItem');
const PaymentProof = require('../models/PaymentProof');
const User = require('../models/User');
const Address = require('../models/Address');
const DeliveryOption = require('../models/DeliveryOption');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { paymentUploader } = require('../configs/uploader');
const fs = require('fs');
const Message = require('../models/Message');
const PaymentMethod = require('../models/PaymentMethod');
const { Op } = require('sequelize');

module.exports = {
  addCheckout: async (req, res) => {
    try {
      let { notes, addressId, deliveryoptionId, orderItems, paymentmethodId } = req.body.dataCheckout;

      // check stock product
      for (let i = 0; i < orderItems.length; i++) {
        let notAvailable = await Product.findOne({
          where: {
            id: orderItems[i].product.id,
            [Op.or]: { stock_in_unit: 0, deletedAt: { [Op.not]: null } },
          },
        });
        if (notAvailable) {
          throw new Error('there are product not available!');
        }
      }

      // create invoice header
      const newInvoiceHeader = await InvoiceHeader.create(
        {
          notes,
          addressId,
          userId: req.user.id,
          deliveryoptionId,
          paymentmethodId,
        },
        { raw: true }
      );

      // create invoice items
      const newInvoiceItems = await InvoiceItem.bulkCreate(
        orderItems.map((item) => ({
          quantity: item.quantity,
          productId: item.productId,
          price: item.product.price_sell,
        }))
      );

      await newInvoiceHeader.addInvoiceitems(newInvoiceItems);

      // delete items cart
      await Cart.destroy({
        where: {
          id: orderItems.map((item) => item.id),
        },
      });

      // get new total cart
      const count = await Cart.count({
        where: {
          userId: req.user.id,
        },
      });

      // update stock in product
      await orderItems.map((item) => {
        Product.update(
          {
            stock_in_unit: item.product.stock_in_unit - item.quantity,
            stock: Math.floor((item.product.stock_in_unit - item.quantity) / item.product.volume),
          },
          { where: { id: item.product.id } }
        );
      });

      res.status(201).send({
        message: 'Checkout added',
        invoice: newInvoiceHeader.id,
        createdAt: newInvoiceHeader.createdAt,
        cartTotal: count,
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  getCheckoutOptions: async (req, res) => {
    try {
      const payments = await PaymentMethod.findAll({});
      const deliveryoptions = await DeliveryOption.findAll({});
      const addresses = await Address.findAll({
        where: {
          userId: req.user.id,
        },
      });

      res.status(200).send({ payments, deliveryoptions, addresses });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  editPhone: async (req, res) => {
    try {
      const { phone_number } = req.body;

      await User.update({ phone_number }, { where: { id: req.params.id } });

      res.status(200).send({ message: 'Phone number updated' });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  addAddress: async (req, res) => {
    try {
      const { address, city, province, country, postalcode } = req.body;

      const totalAddress = await Address.count({ where: { userId: req.user.id } });

      if (totalAddress >= 10) {
        return res.send({ conflict: 'Cannot have more than 10 addresses' });
      }

      const existingAddress = await Address.findOne({
        where: {
          address,
          city,
          country,
          province,
          postalcode,
          userId: req.user.id,
        },
      });

      const defaultAddress = await Address.findOne({
        where: { userId: req.user.id, is_default: true },
      });

      if (existingAddress) {
        return res.send({ conflict: 'This address already exist' });
      } else if (defaultAddress) {
        await Address.create({
          address,
          city,
          province,
          country,
          postalcode,
          userId: req.user.id,
        });
      } else {
        await Address.create({
          address,
          city,
          province,
          country,
          postalcode,
          userId: req.user.id,
          is_default: true,
        });
      }

      const response = await Address.findAll({
        where: { userId: req.user.id },
      });

      res.status(200).send({ data: response, message: 'New address added' });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  addProof: async (req, res) => {
    try {
      const upload = paymentUploader().fields([{ name: 'file' }]);

      // multer
      upload(req, res, async (error) => {
        try {
          let { invoiceheaderId, currentPage, limit } = JSON.parse(req.body.data);

          const checkIsUploaded = await PaymentProof.findOne({
            where: {
              invoiceheaderId,
            },
          });

          if (checkIsUploaded) {
            throw new Error('Your proof have been uploaded');
          }

          const { file } = req.files;

          const filepath = file ? `images/payment/${file[0].filename}` : null;

          await PaymentProof.create({
            path: filepath,
            invoiceheaderId,
          });

          await InvoiceHeader.update({ status: 'pending' }, { where: { id: invoiceheaderId } });

          await Message.create({
            userId: req.user.id,
            to: 'admin',
            header: `Awaiting Approval for Invoice #${invoiceheaderId}`,
            content: `User ID #${req.user.id} (${req.user.name}) has made the payment for Invoice #${invoiceheaderId}.|Please continue with the appropriate approval process for this invoice.|Thank you and have a nice day :)|**This is an automated message**`,
          });

          if (currentPage || limit) {
            const { rows, count } = await InvoiceHeader.findAndCountAll({
              where: { userId: req.user.id, status: 'awaiting' },
              attributes: [
                'id',
                'createdAt',
                [
                  sequelize.literal(
                    `(SELECT SUM(price * quantity) FROM invoiceitems WHERE invoiceitems.invoiceheaderId = invoiceheader.id)`
                  ),
                  'total',
                ],
              ],
              include: [
                {
                  model: InvoiceItem,
                  attributes: ['id', 'price', 'quantity', 'subtotal'],
                  include: [
                    {
                      model: Product,
                      attributes: ['name', 'image', 'unit'],
                      paranoid: false,
                    },
                  ],
                },
                {
                  model: DeliveryOption,
                  attributes: ['name', 'cost'],
                  paranoid: false,
                },
              ],
              limit,
              offset: limit * currentPage - limit,
            });

            res.status(200).send({
              message: 'file uploaded',
              rows,
              count,
              maxPage: Math.ceil(count / limit) || 1,
            });
          } else {
            res.status(200).send({ message: 'file uploaded' });
          }
        } catch (error) {
          fs.unlinkSync(req.files.file[0].path);

          res.status(500).send({ message: error.message });
        }
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  cancelCheckout: async (req, res) => {
    try {
      const { limit, currentPage } = req.body;

      const invoiceData = await InvoiceHeader.findByPk(req.params.id, {
        attributes: [],
        include: [
          {
            model: InvoiceItem,
            attributes: ['quantity', 'productId'],
            include: [
              {
                model: Product,
                attributes: ['stock_in_unit', 'volume'],
                paranoid: false,
              },
            ],
          },
        ],
      });

      invoiceData.invoiceitems.forEach(async (item) => {
        await Product.increment(
          {
            stock_in_unit: item.quantity,
            stock: Math.floor(item.quantity / item.product.volume),
          },
          { where: { id: item.productId } }
        );
      });

      await InvoiceHeader.destroy({ where: { id: req.params.id } });

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
            include: [
              {
                model: Product,
                attributes: ['name', 'image', 'unit'],
                paranoid: false,
              },
            ],
          },
          {
            model: DeliveryOption,
            attributes: ['name', 'cost'],
            paranoid: false,
          },
        ],
        limit,
        offset: limit * currentPage - limit,
      });

      res.status(200).send({
        message: 'Transaction cancelled',
        rows,
        count,
        maxPage: Math.ceil(count / limit) || 1,
      });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  getAwaiting: async (req, res) => {
    try {
      // check stock product
      let notAvailable = await InvoiceItem.findAll({
        where: {
          invoiceheaderId: req.params.id,
          '$product.deletedAt$': { [Op.not]: null },
        },
        include: [{ model: Product, paranoid: false }],
      });

      // get data
      const response = await InvoiceHeader.findOne({
        where: { id: req.params.id, userId: req.user.id, status: 'awaiting' },
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
            model: DeliveryOption,
            attributes: ['name', 'cost'],
            paranoid: false,
          },
          { model: PaymentMethod, paranoid: false },
        ],
      });

      res.status(200).send({
        data: response,
        notAvailable: notAvailable.length ? true : false,
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
};
