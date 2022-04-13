const authRouter = require('./authRouter');
const addressRouter = require('./addressRouter');
const categoryRouter = require('./categoryRouter');
const deliveryOptionRouter = require('./deliveryOptionRouter');
const authAdminRouters = require('./authAdminRouters,');

module.exports = {
  authAdminRouters,
  authRouter,
  addressRouter,
  categoryRouter,
  deliveryOptionRouter,
};
