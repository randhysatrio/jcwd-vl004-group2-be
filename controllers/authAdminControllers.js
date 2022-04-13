const Crypto = require('crypto');
const Admin = require('../models/Admin');
const { createToken } = require('../configs/jwtadmin');
const transporter = require('../configs/nodemailer');

module.exports = {
  addAdmin: async (req, res) => {
    try {
      const response = await Admin.create({
        name: 'asep',
        email: 'udidesign3r@gmail.com',
        username: 'asrud',
        password: '123456',
      });

      res.status(200).send({ data: response, message: response.message });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  getAdmin: async (req, res) => {
    try {
      let { email } = req.admin;

      const response = await Admin.findOne({
        where: {
          email,
        },
      });

      res.status(200).send({ data: response, message: response.message });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  loginAdmin: async (req, res) => {
    try {
      let { email, password } = req.body;

      // Hashing
      password = Crypto.createHmac('sha1', 'hash123')
        .update(password)
        .digest('hex');

      // Check email & password
      const login = await Admin.findOne({
        where: {
          email,
          password,
        },
      });

      if (login) {
        // create token
        let { id, name, email, username, password } = login;
        let token = createToken({
          id,
          name,
          email,
          username,
          password,
        });

        delete login.password;
        res
          .status(200)
          .send({ data: login, token: token, message: 'Login successed' });
      } else {
        throw new Error('Wrong email or password');
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  reqResetPassword: async (req, res) => {
    try {
      const { email } = req.body;

      // Check email for reset
      const reset = await Admin.findOne({
        where: {
          email,
        },
      });

      if (reset) {
        // Create token for send to email reset
        const { id, name, email, username, password } = reset;
        const token = createToken({
          id,
          name,
          email,
          username,
          password,
        });

        // Setup email message
        let mail = {
          from: 'Admin Heizen Berg Co',
          to: `${email}`,
          subject: 'Reset Password',
          html: `<a href="http://localhost:3000/admin/change-password/${token}">Click here to reset your password!</a>`,
        };

        // Send link for reset password
        await transporter.sendMail(mail);

        res.status(200).send({
          message: 'Reset link has been sent to your email',
        });
      } else {
        throw new Error('Email not registered');
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  changePassword: async (req, res) => {
    try {
      const { email } = req.admin;
      let { password } = req.body.password;

      // Hashing
      password = Crypto.createHmac('sha1', 'hash123')
        .update(password)
        .digest('hex');

      // Update password
      await Admin.update(
        { password },
        {
          where: {
            email,
          },
        }
      );

      res.status(201).send({ message: 'Password updated' });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
};
