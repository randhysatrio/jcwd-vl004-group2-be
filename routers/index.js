const authRouter = require('./authRouter');
const addressRouter = require('./addressRouter');
const categoryRouter = require('./categoryRouter');
const deliveryOptionRouter = require('./deliveryOptionRouter');
const authAdminRouters = require('./authAdminRouters');
const productRouter = require('./productRouter');
const transactionAdminRouter = require('./transactionAdminRouter');
const cartRouter = require('./cartRouter');
const userRouter = require('./userRouter');
const checkoutRouter = require('./checkoutRouter');

module.exports = {
  authAdminRouters,
  authRouter,
  addressRouter,
  categoryRouter,
  deliveryOptionRouter,
  productRouter,
  transactionAdminRouter,
  cartRouter,
  userRouter,
  checkoutRouter,
};
