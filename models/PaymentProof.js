const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

const PaymentProof = sequelize.define('paymentproof', {
  path: {
    type: DataTypes.STRING,
  },
});

module.exports = PaymentProof;
