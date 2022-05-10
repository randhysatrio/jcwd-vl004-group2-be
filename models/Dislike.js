const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

const Dislike = sequelize.define('dislike', {});

module.exports = Dislike;
