const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');
const Product = require('./Product');

const Admin = sequelize.define('admin', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  username: DataTypes.STRING,
  password: {
    type: DataTypes.STRING(1000),
    allowNull: false,
  },
  profile_picture: DataTypes.STRING,
});

Admin.hasMany(Product);
Product.belongsTo(Admin);

module.exports = Admin;
