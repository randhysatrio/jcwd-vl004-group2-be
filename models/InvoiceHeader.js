const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

const InvoiceItem = require('./InvoiceItem');
const PaymentProof = require('./PaymentProof');

const InvoiceHeader = sequelize.define('invoiceheader', {
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    allowNull: false,
    validate: {
      isIn: {
        args: [['pending', 'approved', 'rejected']],
        msg: 'Value is not supported',
      },
    },
  },
  notes: {
    type: DataTypes.STRING(1024),
  },
  is_received: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  invoice_path: {
    type: DataTypes.STRING,
  },
});

InvoiceHeader.hasMany(InvoiceItem);
InvoiceItem.belongsTo(InvoiceHeader);

InvoiceHeader.hasOne(PaymentProof);
PaymentProof.belongsTo(InvoiceHeader);

module.exports = InvoiceHeader;
