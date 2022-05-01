const express = require('express');
const cors = require('cors');
const sequelize = require('./configs/sequelize');
const passport = require('passport');
const cookieSession = require('cookie-session');
const bearerToken = require('express-bearer-token');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('./configs/passport');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

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

// socket.io

app.use('/', (req, res) => {
  try {
    res.status(200).send('Welcome to Heizen Berg API + Socket.io Server');
  } catch (err) {
    res.status(500).send(err);
  }
});

let onlineUsers = [];
let onlineAdmins = [];

io.on('connection', (socket) => {
  console.log(`${socket.id}} has connected!`);

  socket.on('userJoin', (userId) => {
    if (onlineUsers.some((user) => user.id !== userId) || !onlineUsers.length) {
      onlineUsers.push({ id: userId, socketId: socket.id });
      console.log(onlineUsers);
    }
  });

  socket.on('adminJoin', (adminId) => {
    if (onlineAdmins.some((admin) => admin.id !== adminId) || !onlineAdmins.length) {
      onlineAdmins.push({ id: adminId, socketId: socket.id });
      console.log(onlineAdmins);
    }
  });

  socket.on('disconnect', () => {
    if (onlineUsers.some((user) => user.socketId == socket.id)) {
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      console.log(onlineUsers);
      console.log('a user has disconnect');
    } else {
      onlineAdmins = onlineAdmins.filter((admin) => admin.socketId !== socket.id);
      console.log(onlineUsers);
      console.log('an admin has disconnect');
    }
  });
});

app.listen(5000, () => console.log('API running at port 5000'));
httpServer.listen(7000, () => {
  console.log('Socket.io server running at port 7000');
});
