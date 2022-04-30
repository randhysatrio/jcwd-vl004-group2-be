const InvoiceItem = require('../models/InvoiceItem');
const Product = require('../models/Product');
const Category = require('../models/Category');

module.exports = {
  repeat: async (req, res) => {
    try {
      const items = await InvoiceItem.findAll({
        where: { invoiceheaderId: req.params.id },
        include: [{ model: Product, include: [{ model: Category, paranoid: false }], paranoid: false }],
      });

      res.status(200).send(items);
    } catch (error) {
      res.status(500).send(err);
    }
  },
};
