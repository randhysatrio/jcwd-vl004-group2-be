const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

const InvoiceItem = sequelize.define('invoiceitem', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = InvoiceItem;
