const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

const Address = require('./Address');
const Cart = require('./Cart');
const InvoiceHeader = require('./InvoiceHeader');

const User = sequelize.define('user', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: {
        args: /^[a-zA-Z0-9 ]*$/,
        msg: 'Name cannot contain special characters',
      },
    },
  },
  username: {
    type: DataTypes.STRING,
    validate: {
      is: {
        args: /^[a-zA-Z0-9._]*$/,
        msg: 'Only alphanumeric characters, (-), (_), and (.) is allowed',
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: {
        msg: 'Please enter a valid email address',
      },
    },
  },
  password: {
    type: DataTypes.STRING(1024),
  },
  phone_number: {
    type: DataTypes.STRING(1024),
  },
  profile_picture: {
    type: DataTypes.STRING,
    // changed later definitely!
    defaultValue: 'path to default user image',
  },
  is_verified: {
    type: DataTypes.STRING,
    defaultValue: 'unverified',
    allowNull: false,
    validate: {
      isIn: {
        args: ['unverified', 'verified'],
        msg: 'Only verified or unverified is allowed',
      },
    },
  },
  sent_verification_email: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  googleId: {
    type: DataTypes.STRING,
  },
});

User.hasMany(Address);
Address.belongsTo(User);

User.hasMany(Cart);
Cart.belongsTo(User);

User.hasMany(InvoiceHeader);
InvoiceHeader.belongsTo(User);

module.exports = User;
