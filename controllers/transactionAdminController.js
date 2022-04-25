const InvoiceHeader = require('../models/InvoiceHeader');
const InvoiceItem = require('../models/InvoiceItem');
const User = require('../models/User');
const Address = require('../models/Address');
const Product = require('../models/Product');
const DeliveryOption = require('../models/DeliveryOption');

module.exports = {
  getTransaction: async (req, res) => {
    try {
      const response = await InvoiceHeader.findAll({
        include: [
          { model: User },
          { model: Address },
          { model: DeliveryOption },
          { model: InvoiceItem, include: [Product] },
        ],
      });

      res.status(200).send({ data: response });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
};
