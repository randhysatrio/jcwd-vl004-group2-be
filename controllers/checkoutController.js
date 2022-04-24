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

module.exports = {
  addCheckout: async (req, res) => {
    try {
      let { notes, addressId, userId, deliveryoptionId, orderItems } =
        req.body.dataCheckout;

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

      // update stock in product
      await orderItems.map((item) => {
        Product.update(
          {
            stock_in_unit: item.product.stock_in_unit - item.quantity,
            stock: Math.ceil(item.product.stock_in_unit / item.product.volume),
          },
          { where: { id: item.product.id } }
        );
      });

      res
        .status(201)
        .send({ message: 'Checkout added', invoice: newInvoiceHeader.id });
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
  getPhone: async (req, res) => {
    try {
      const response = await User.findOne({
        where: { id: req.params.id },
        raw: true,
      });

      res.status(200).send({ data: response.phone_number });
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
  selectAddress: async (req, res) => {
    try {
      const { id, lastId } = req.body;

      // update new selected default
      await Address.update(
        { default: true },
        {
          where: {
            id,
          },
        }
      );

      // update last selected to not default
      await Address.update(
        { default: false },
        {
          where: {
            id: lastId,
          },
        }
      );

      res.status(200).send({ message: 'Address selected' });
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
          let { invoiceheaderId } = JSON.parse(req.body.data);

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

          const response = await PaymentProof.create({
            path: filepath,
            invoiceheaderId,
          });

          if (response) {
            res.status(200).send({ message: 'file uploaded' });
          } else {
            fs.unlinkSync('./public' + filepath);
          }
        } catch (error) {
          console.log('error ini');
          res.status(500).send({ message: error.message });
        }
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
};
