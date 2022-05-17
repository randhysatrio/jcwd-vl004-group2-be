const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

const InvoiceHeader = require('./InvoiceHeader');

const PaymentMethod = sequelize.define(
  'paymentmethod',
  {
    bankname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    paranoid: true,
  }
);

PaymentMethod.hasOne(InvoiceHeader);
InvoiceHeader.belongsTo(PaymentMethod);

module.exports = PaymentMethod;
