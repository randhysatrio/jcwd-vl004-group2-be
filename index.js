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

const { authRouter } = require('./routers');
app.use('/auth', authRouter);

app.listen(5000, () => console.log('API running at port 5000'));
