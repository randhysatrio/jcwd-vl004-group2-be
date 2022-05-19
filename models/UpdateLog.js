const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

// perlu ditambahkan adminId => tinggal Admin_Model.hasMany(UpdateLog)
const UpdateLog = sequelize.define('updatelog', {
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  current_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  prev_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = UpdateLog;
