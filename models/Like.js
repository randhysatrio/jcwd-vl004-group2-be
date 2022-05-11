const sequelize = require('../configs/sequelize');
const { DataTypes } = require('sequelize');

const Like = sequelize.define('like', {});

module.exports = Like;
