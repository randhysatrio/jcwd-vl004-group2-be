const passport = require('passport');
const User = require('../models/User');
const { createVerificationToken } = require('../configs/jwtuser');
const transporter = require('./nodemailer');

const GOOGLE_CLIENT_ID = '454661987895-tq6a86lgbfst3gjunn19qsnm1c31f8va.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async function (accessToken, refreshToken, profile, cb) {
      const userData = await User.findOrCreate({
        where: { email: profile.emails[0].value },
        defaults: {
          name: profile.displayName,
          email: profile.emails[0].value,
          profile_picture: profile.photos[0].value,
          googleId: profile.id,
        },
      });

      if (!userData[0].googleId) {
        userData[0].googleId = profile.id;

        await userData[0].save();
      }

      if (!userData[0].sent_verification_email) {
        const verificationToken = createVerificationToken({
          id: userData[0].id,
        });

        await transporter.sendMail({
          from: 'HeizenbergAdmin <admin@heizenbergco.com>',
          to: `${profile.emails[0].value}`,
          subject: 'Heizen Berg Co. Account Verification',
          html: `
            <p>Hello, ${profile.displayName}!</p>
            <br/>
            <p>Thank you for joining Heizen Berg Co.</p>
            <p>Please verify your account by clicking the link bellow</p>
            <a href="http://localhost:3000/verify/${verificationToken}">Verify My Account</a>
            <br/>
            <p>Regards, </p>
            <p><b>The Heizen Berg Co. Admin Team</b></p>`,
        });

        userData[0].sent_verification_email = true;

        await userData[0].save();
      }

      return cb(null, userData[0]);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
