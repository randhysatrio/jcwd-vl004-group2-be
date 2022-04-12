const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

const InvoiceHeader = require('./InvoiceHeader');

const DeliveryOption = sequelize.define(
  'deliveryoption',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    paranoid: true,
  }
);

DeliveryOption.hasOne(InvoiceHeader);
InvoiceHeader.belongsTo(DeliveryOption);

module.exports = DeliveryOption;
