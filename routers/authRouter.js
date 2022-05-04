const router = require('express').Router();
const passport = require('passport');
const CLIENT_URL = 'http://localhost:3000/';
const { createToken, verifyToken, verifyPasswordToken, verifyVerificationToken } = require('../configs/jwtuser');

const { authController } = require('../controllers');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/persistent', verifyToken, authController.persistent);
router.post('/passwordlink', authController.passwordlink);
router.post('/updatepassword', verifyPasswordToken, authController.updatepassword);
router.post('/verify', verifyVerificationToken, authController.verify);

// Passportjs google oauth routes
router.get('/google', passport.authenticate('google'));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: CLIENT_URL,
    failureRedirect: '/login/failed',
  })
);

router.get('/login/success', (req, res) => {
  if (req.user) {
    const token = createToken({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    });

    res.status(200).send({ user: req.user, token });
  } else {
    res.send({ ignore: true });
  }
});

router.get('/login/failed', (req, res) => {
  return res.status(401).send('You are not authenticated');
});

router.get('/logout', (req, res) => {
  req.logOut();
  res.redirect(CLIENT_URL);
});

module.exports = router;
