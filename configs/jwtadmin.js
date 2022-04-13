const jwt = require('jsonwebtoken');

module.exports = {
  auth: (req, res, next) => {
    try {
      let token = req.headers.authorization;
      jwt.verify(token, process.env.SECRET_KEY, (err, decode) => {
        if (err) {
          throw new Error(err.message);
        }
        req.admin = decode;
        next();
      });
    } catch (error) {
      res.status(401).json({
        message: error.message,
      });
    }
  },
  createToken: (payload) => {
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '12h' });
  },
};
