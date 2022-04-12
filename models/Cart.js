const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

const Cart = sequelize.define('cart', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Cart;
