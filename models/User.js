const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

const Address = require('./Address');
const Cart = require('./Cart');
const InvoiceHeader = require('./InvoiceHeader');
const Message = require('./Message');
const Review = require('./Review');
const Like = require('./Like');

const User = sequelize.define('user', {
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
  username: {
    type: DataTypes.STRING,
    validate: {
      is: {
        args: /^[a-zA-Z0-9._]*$/,
        msg: 'Only alphanumeric characters, contain no spaces, (-), (_), and (.) is allowed',
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
    type: DataTypes.STRING,
    validate: {
      is: {
        args: /^(\+62|62)?[\s-]?0?8[1-9]{1}\d{1}[\s-]?\d{4}[\s-]?\d{2,5}$/,
        msg: 'Please enter a valid phone number',
      },
    },
  },
  profile_picture: {
    type: DataTypes.STRING,
    defaultValue: 'public/images/profile/default.png',
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

User.hasMany(Message);
Message.belongsTo(User);

User.hasMany(Review);
Review.belongsTo(User);

User.hasMany(Like);
Like.belongsTo(User);

module.exports = User;
