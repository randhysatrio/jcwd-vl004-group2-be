const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');
const Message = require('./Message');

const Admin = sequelize.define('admin', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Invalid email',
      },
    },
  },
  username: DataTypes.STRING,
  password: {
    type: DataTypes.STRING(1000),
    allowNull: false,
  },
  profile_picture: {
    type: DataTypes.STRING,
    defaultValue: 'public/images/profile/default.png',
  },
});

Admin.hasMany(Message);
Message.belongsTo(Admin);

module.exports = Admin;
