const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'randhysatrio@gmail.com',
    pass: 'qkkxnnunkbcaxqdp',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = transporter;
