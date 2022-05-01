require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./configs/sequelize');
const passport = require('passport');
const cookieSession = require('cookie-session');
const bearerToken = require('express-bearer-token');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('./configs/passport');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

app.use(
  cors({
    origin: process.env.CLIENT_URL,
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
  transactionAdminRouter,
  transactionUserRouter,
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
app.use('/history', transactionUserRouter);

// Socket.io
app.use('/', (req, res) => {
  try {
    res.status(200).send('Welcome to Heizen Berg Socket.io Server!');
  } catch (error) {
    res.status(500).send(err);
  }
});

let users = [];
let admins = [];

io.on('connection', (socket) => {
  console.log(`${socket.id} has connected`);

  socket.on('userJoin', (userId) => {
    if (!users.length || !users.some((user) => user.id === userId)) {
      users.push({ id: userId, socketId: socket.id });
      console.log(users);
    }
  });

  socket.on('disconnect', () => {
    users = users.filter((user) => user.socketId !== socket.id);
    console.log(users);
    console.log(`${socket.id} has disconnected`);
  });
});

app.listen(5000, () => console.log('API running at port 5000'));
httpServer.listen(7000, () => console.log('Socket.io Server running at Port 7000'));
