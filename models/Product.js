const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

const Cart = require('./Cart');
const InvoiceItem = require('./InvoiceItem');
const UpdateLog = require('./UpdateLog');

const Product = sequelize.define(
  'product',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price_buy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: {
          msg: 'Only number is allowed',
        },
      },
    },
    price_sell: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: {
          msg: 'Only number is allowed',
        },
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: {
          msg: 'Only number is allowed',
        },
      },
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['ml', 'g']],
          msg: 'Only ml and g is allowed',
        },
      },
    },
    volume: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: {
          msg: 'Only number is allowed',
        },
      },
    },
    stock_in_unit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isNumeric: {
          msg: 'Only number is allowed',
        },
      },
    },
    description: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    image: DataTypes.STRING,
    appearence: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    paranoid: true,
  }
);

Product.hasMany(Cart, { onDelete: 'CASCADE' });
Cart.belongsTo(Product);

Product.hasMany(InvoiceItem);
InvoiceItem.belongsTo(Product);

Product.hasMany(UpdateLog, { onDelete: 'CASCADE' });
UpdateLog.belongsTo(Product);

module.exports = Product;
