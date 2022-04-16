const authRouter = require('./authRouter');
const addressRouter = require('./addressRouter');
const categoryRouter = require('./categoryRouter');
const deliveryOptionRouter = require('./deliveryOptionRouter');
const authAdminRouters = require('./authAdminRouters');
const productRouter = require('./productRouter');
const cartRouter = require('./cartRouter');

module.exports = {
  authAdminRouters,
  authRouter,
  addressRouter,
  categoryRouter,
  deliveryOptionRouter,
  productRouter,
  cartRouter,
};
