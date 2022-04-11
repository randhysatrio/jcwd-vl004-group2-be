const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

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

module.exports = Category;
