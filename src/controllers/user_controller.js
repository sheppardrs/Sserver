import jwt from 'jwt-simple';
// import { AUTH_SECRET } from 'babel-plugin-dotenv';
import dotenv from 'dotenv';
import User from '../models/user_model';

// make the secret available as process.env.AUTH_SECRET
dotenv.config({ silent: true });

// TODO: REMOVE after testing
// Debugging dotenv AUTH_SECRET
// console.log('________ in user_controller, AUTH_SECRET is', process.env.AUTH_SECRET);


function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, at: timestamp }, process.env.AUTH_SECRET);
}

// passport middleware does the verification so
// only returns a token
export const signin = (req, res, next) => {
  res.send({ token: tokenForUser(req.user), username: req.user.username });
};

export const signup = (req, res, next) => {
  const theemail = req.body.email;
  const thepassword = req.body.password;
  const theusername = req.body.username;

  // check that both the email and password exist
  if (!theemail || !thepassword || !theusername) {
    return res.status(422).send('You must provide email and password and username to sign up.');
  }

  // check that the email does not already exist in db
  User.find({ email: theemail }).then((user) => {
    if (user.length) {
      return res.status(433).send('Email already in use.');
    }
  });

  // check that the username does not already exist in db
  User.find({ username: theusername }).then((user) => {
    if (user.length) {
      return res.status(434).send('Username already in use.');
    }
  });

  // if user doesn't exist, create a new user
  const user = new User();
  user.email = theemail;
  user.password = thepassword;
  user.username = theusername;

  user.save()
    .then((result) => {
      res.send({ token: tokenForUser(user) });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
