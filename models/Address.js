const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

const Address = sequelize.define(
  'address',
  {
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postalcode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: {
          msg: 'Only number is allowed in postal code',
        },
      },
    },
  },
  {
    paranoid: true,
  }
);

module.exports = Address;
