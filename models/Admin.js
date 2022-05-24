const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');
const Message = require('./Message');

const Admin = sequelize.define(
  'admin',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /^[a-zA-Z. ]*$/,
          msg: 'Name cannot contain number or special characters',
        },
      },
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
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /^[a-zA-Z0-9._]*$/,
          msg: 'Only alphanumeric characters, (-), (_), (.) is allowed and no spaces',
        },
      },
    },
    profile_picture: {
      type: DataTypes.STRING,
      defaultValue: 'public/images/profile/default.png',
    },
    phone_number: {
      type: DataTypes.STRING,
      validate: {
        is: {
          args: /^(\+62|62)?[\s-]?0?8[1-9]{1}\d{1}[\s-]?\d{4}[\s-]?\d{2,5}$/,
          msg: 'Please enter a valid phone number',
        },
      },
    },
    address: {
      type: DataTypes.STRING(1024),
    },
    is_super: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    paranoid: true,
  }
);

Admin.hasMany(Message);
Message.belongsTo(Admin);

module.exports = Admin;
