require('dotenv').config();
const { createToken, createVerificationToken, createPasswordToken } = require('../configs/jwtuser');
const transporter = require('../configs/nodemailer');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Crypto = require('crypto');

module.exports = {
  register: async (req, res) => {
    try {
      req.body.password = Crypto.createHmac('SHA256', process.env.CRYPTO_KEY).update(req.body.password).digest('hex');

      const { name, email, password } = req.body;

      const emailCheck = await User.findAll({ where: { email } });

      if (emailCheck.length) {
        return res.send({ errMsg: 'This email has already been registered' });
      }

      const newUser = await User.create(
        {
          name,
          email,
          password,
        },
        {
          fields: ['name', 'email', 'password'],
        }
      );

      const verificationToken = createVerificationToken({
        id: newUser.id,
      });

      await transporter.sendMail({
        from: 'HeizenbergAdmin <admin@heizenbergco.com>',
        to: `${email}`,
        subject: 'Heizen Berg Co. Account Verification',
        html: `
          <p>Hello, ${name}!</p>
          <br/>
          <p>Thank you for joining Heizen Berg Co.</p>
          <P>We are glad to have you as part of the Heizen Berg Co. community!</p>
          <p>Please verify your account by clicking the link below:</p>
          <a href="${process.env.CLIENT_URL}/verify/${verificationToken}">Verify My Account</a>
          <br/>
          <p>Regards, </p>
          <p><b>The Heizen Berg Co. Admin Team</b></p>`,
      });

      newUser.sent_verification_email = true;

      await newUser.save();

      const token = createToken({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      });

      res.status(201).send({ user: newUser, token });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  login: async (req, res) => {
    try {
      req.body.password = Crypto.createHmac('SHA256', process.env.CRYPTO_KEY).update(req.body.password).digest('hex');

      const { email, password } = req.body;

      const userData = await User.findOne({ where: { email, password } });

      if (!userData) {
        return res.send({ invalid: true });
      } else if (!userData.active) {
        return res.send({ conflict: true, message: 'This account is currently inactive!' });
      } else {
        const cartTotal = await Cart.count({ where: { userId: userData.id } });

        const token = createToken({
          id: userData.id,
          name: userData.name,
          email: userData.email,
        });

        res.status(200).send({ user: userData, token, cartTotal });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
  persistent: async (req, res) => {
    try {
      const { id } = req.user;

      const userData = await User.findByPk(id);

      if (!userData.active) {
        return res.send({ conflict: true, message: 'This account is currently inactive!' });
      }

      const token = createToken({
        id: userData.id,
        name: userData.name,
        email: userData.email,
      });

      const cartTotal = await Cart.count({ where: { userId: id } });

      res.status(200).send({ user: userData, token, cartTotal });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  passwordlink: async (req, res) => {
    try {
      const { email } = req.body;

      const userData = await User.findOne({ where: { email } });

      if (!userData) {
        return res.send({ userNotFound: 'This email is not registered!' });
      }

      const token = createPasswordToken({ email });

      await transporter.sendMail({
        from: 'HeizenbergAdmin <admin@heizenbergco.com>',
        to: `${email}`,
        subject: 'Heizen Berg Co. Password Change',
        html: `
        <p>Dear ${userData.name},</p>
        <br/>
        <p>Here is the link you've requested to change your account password:</p>
        <a href="${process.env.CLIENT_URL}/changepassword/${token}">Change your password</a>
        <p>On a side note, this link will only be valid for <b>30 minutes</b> starting from the time this email is sent to you</p>
        <br/>
        <p><i>(Please ignore this email if you didn't requested for password change and immediately contact the Heizen Berg admin team at admin@heizenbergco.com)</i></p>
        <br/>
        <p>Regards, </p>
        <p><b>The Heizen Berg Co. Admin Team</b></p>`,
      });

      res.status(200).send({ sent: true });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  updatepassword: async (req, res) => {
    try {
      req.body.password = Crypto.createHmac('SHA256', process.env.CRYPTO_KEY).update(req.body.password).digest('hex');

      const { password } = req.body;

      await User.update({ password }, { where: { email: req.user.email } });

      res.status(200).send({ success: true });
    } catch (err) {
      res.status(500).send(err);
    }
  },
  verify: async (req, res) => {
    try {
      const userData = await User.findByPk(req.user.id);

      userData.is_verified = 'verified';

      await userData.save();

      const token = createToken({
        id: userData.id,
        name: userData.name,
        email: userData.email,
      });

      res.status(200).send({ success: true, user: userData, token });
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
