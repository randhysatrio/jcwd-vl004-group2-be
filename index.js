const express = require('express');
const cors = require('cors');
const sequelize = require('./configs/sequelize');
const passport = require('passport');
const cookieSession = require('cookie-session');
const bearerToken = require('express-bearer-token');
require('./configs/passport');
require('dotenv').config();

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PATCH,DELETE',
    credentials: true,
  })
);
app.use(express.json());
app.use(bearerToken());
app.use(
  cookieSession({
    name: 'heizenberg-cookie',
    keys: [process.env.COOKIE_KEY],
  })
);
app.use(passport.initialize());
app.use(passport.session());

(async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync({ alter: true });
    console.log('sequelize connection success!');
  } catch (error) {
    console.log(error);
  }
})();

const {
  authRouter,
  authAdminRouters,
  addressRouter,
  categoryRouter,
  deliveryOptionRouter,
  productRouter,
  cartRouter,
  userRouter,
  checkoutRouter,
  transactionAdminRouter
} = require('./routers');

app.use('/public', express.static('public'));
app.use('/auth', authRouter);
app.use('/address', addressRouter);
app.use('/category', categoryRouter);
app.use('/deliveryoption', deliveryOptionRouter);
app.use('/admin/auth', authAdminRouters);
app.use('/admin/transaction', transactionAdminRouter);
app.use('/product', productRouter);
app.use('/cart', cartRouter);
app.use('/user', userRouter);
app.use('/checkout', checkoutRouter);

app.listen(5000, () => console.log('API running at port 5000'));
