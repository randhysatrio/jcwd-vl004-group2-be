require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = {
  createToken: (payload) => {
    return jwt.sign(payload, process.env.JWT_ACCESS_KEY);
  },
  createPasswordToken: (payload) => {
    return jwt.sign(payload, process.env.JWT_PASSWORD_KEY, { expiresIn: '30m' });
  },
  createVerificationToken: (payload) => {
    return jwt.sign(payload, process.env.JWT_VERIFICATION_KEY);
  },
  verifyToken: (req, res, next) => {
    const token = req.token;

    if (!token) {
      return res.status(401).send('You are not authorized');
    }

    jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, decoded) => {
      if (err) {
        return res.status(500).send(err);
      }
      req.user = decoded;

      next();
    });
  },
  verifyPasswordToken: (req, res, next) => {
    const token = req.token;

    if (!token) {
      return res.status(401).send('You are not authorized');
    }

    jwt.verify(token, process.env.JWT_PASSWORD_KEY, (err, decoded) => {
      if (err) {
        return res.status(500).send(err);
      }
      req.user = decoded;

      next();
    });
  },
  verifyVerificationToken: (req, res, next) => {
    const token = req.token;

    if (!token) {
      return res.status(401).send('You are not authorized');
    }

    jwt.verify(token, process.env.JWT_VERIFICATION_KEY, (err, decoded) => {
      if (err) {
        return res.status(500).send(err);
      }
      req.user = decoded;

      next();
    });
  },
};
