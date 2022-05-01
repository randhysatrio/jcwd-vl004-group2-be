const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

const Message = sequelize.define('message', {
  header: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.STRING(1024),
    allowNull: false,
  },
  is_new: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Message;
