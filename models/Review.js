const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

const Like = require('./Like');
const Dislike = require('./Dislike');

const Review = sequelize.define('review', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
  },
  is_anonymus: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
});

Review.hasMany(Like, { onDelete: 'CASCADE' });
Like.belongsTo(Review);

Review.hasMany(Dislike, { onDelete: 'CASCADE' });
Dislike.belongsTo(Review);

module.exports = Review;
