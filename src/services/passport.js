import passport from 'passport';
import LocalStrategy from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import User from '../models/user_model';

// email is username
const localOptions = { usernameField: 'email' };

// oprtion for the jwt strategy
// we'll pass in the jwt in an 'authoriation' header
// so passport can ind it there
const jwtOptions = {
  jwtFromRequests: ExtractJwt.fromHeader('authorization'),
  secretOrKey: process.env.AUTH_SECRET,
};

// username + password authentication strategy
const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
  // find the user by email and check the password using method
  User.findOne({ email }, (err, user) => {
    if (err) { return done(err); }

    if (!user) { return done(null, false); }

    // compare the passwords - is 'password' equal to user.password
    user.comparePassword(password, (err, isMatch) => {
      if (err) {
        done(err);
      } else if (!isMatch) {
        done(null, false);
      } else {
        done(null, user);
      }
    });
  });
});

const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  // called with confirmed jwt, so just chekcs that the user exits
  User.findById(payload.sub, (err, user) => {
    if (err) {
      done(err, false);
    } else if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

passport.use(jwtLogin);
passport.use(localLogin);

export const requireAuth = passport.authenticate('jwt', { session: false });
export const requireSignin = passport.authenticate('local', { session: false });
