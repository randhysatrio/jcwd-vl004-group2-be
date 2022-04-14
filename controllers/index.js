const authController = require('./authController');
const addressController = require('./addressController');
const categoryController = require('./categoryController');
const deliveryOptionController = require('./deliveryOptionController');
const authAdminControllers = require('./authAdminControllers');

module.exports = {
  authAdminControllers,
  authController,
  addressController,
  categoryController,
  deliveryOptionController,
};
