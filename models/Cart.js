const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

const Cart = sequelize.define('cart', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isChecked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  subtotal: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.product?.price_sell * this.quantity;
    },
  },
});

module.exports = Cart;
