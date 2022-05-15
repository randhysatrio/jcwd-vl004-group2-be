const sequelize = require('../configs/sequelize');
const InvoiceHeader = require('../models/InvoiceHeader');
const InvoiceItem = require('../models/InvoiceItem');
const PaymentProof = require('../models/PaymentProof');
const User = require('../models/User');
const Address = require('../models/Address');
const DeliveryOption = require('../models/DeliveryOption');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { uploader } = require('../configs/uploaderPayment');
const fs = require('fs');
const Message = require('../models/Message');

module.exports = {
  addCheckout: async (req, res) => {
    try {
      let { notes, addressId, userId, deliveryoptionId, orderItems } = req.body.dataCheckout;

      // create invoice header
      const newInvoiceHeader = await InvoiceHeader.create(
        {
          notes,
          addressId,
          userId,
          deliveryoptionId,
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
        cartTotal: count,
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  getDelivery: async (req, res) => {
    try {
      const response = await DeliveryOption.findAll({});

      res.status(200).send({ data: response });
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
      const { address, city, province, country, postalcode, userId } = req.body;

      await Address.create({
        address,
        city,
        province,
        country,
        postalcode,
        userId,
      });

      res.status(200).send({ message: 'New address added' });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  addProof: async (req, res) => {
    try {
      let path = '/images/payment';
      const upload = uploader(path, 'IMG').fields([{ name: 'file' }]);

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

          const filepath = file ? path + '/' + file[0].filename : null;

          await PaymentProof.create({
            path: filepath,
            invoiceheaderId,
          });

          await InvoiceHeader.update({ status: 'pending' }, { where: { id: invoiceheaderId } });

          await Message.create({
            userId: req.user.id,
            to: 'admin',
            header: `Awaiting Approval for Invoice #${invoiceheaderId}`,
            content: `User ID#${req.user.id} (${req.user.name}) has made the payment for Invoice #${invoiceheaderId}.|Please continue with the appropriate approval process for this invoice.|Thank you and have a nice day :)|**This is an automated message**`,
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
                  include: [{ model: Product, attributes: ['name', 'image', 'unit'], paranoid: false }],
                },
                { model: DeliveryOption, attributes: ['name', 'cost'], paranoid: false },
              ],
              limit,
              offset: limit * currentPage - limit,
            });

            res.status(200).send({ message: 'file uploaded', rows, count, maxPage: Math.ceil(count / limit) || 1 });
          } else {
            res.status(200).send({ message: 'file uploaded' });
          }
        } catch (error) {
          console.log(error);
          fs.unlinkSync(req.files.file[0].path);

          res.status(500).send({ message: error.message });
        }
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
};
