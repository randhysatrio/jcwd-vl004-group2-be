const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

const Product = require('./Product');

const Category = sequelize.define(
  'category',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    paranoid: true,
  }
);

Category.hasMany(Product);
Product.belongsTo(Category);

module.exports = Category;
