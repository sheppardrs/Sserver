import jwt from 'jwt-simple';
// import { AUTH_SECRET } from 'babel-plugin-dotenv';
import dotenv from 'dotenv';
import { createTransport } from 'nodemailer';
import User from '../models/user_model';
import Token from '../models/token_model';
// make the secret available as process.env.AUTH_SECRET
dotenv.config({ silent: true });

// TODO: REMOVE after testing
// Debugging dotenv AUTH_SECRET
// console.log('________ in user_controller, AUTH_SECRET is', process.env.AUTH_SECRET);
const signinpage = '<a href="http://sharity.surge.sh/signin">signin</a>';
const homepage = '<a href="http://sharity.surge.sh">homepage</a>';

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, at: timestamp }, process.env.AUTH_SECRET);
}

// passport middleware does the verification so
// only returns a token
export const signin = (req, res, next) => {
  res.send({ token: tokenForUser(req.user), username: req.user.username });
};

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

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

  // Before Verification
  // user.save()
  //   .then((result) => {
  //     res.send({ token: tokenForUser(user) });
  //   })
  //   .catch((error) => {
  //     res.status(500).json({ error });
  //   });

  // after, copied from link in readme
  user.save()
    .then((result) => {
      // create verification token for user
      const token = new Token({
        user: user._id,
        token: tokenForUser(user),
      });

      // save token
      token.save((err) => {
        if (err) {
          console.log('failed in saving token.\n');
          return res.status(500).send({ mess: err.message });
        }

        // send verification email
        const mailOptions = {
          from: 'Sharity <sharitygive@gmail.com',
          to: user.email,
          subject: 'Verify Your Email Address',
          text: `Hi,\n\n Please verify your account by clicking the link: \nhttp://${req.headers.host}/api/confirmation/${token.token}\n`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log('error sending mail\n');
            return res.status(500).send({ mess: err.message });
          } else {
            res.status(200).send(`A verification email has been sent to ${user.email}. Please verify your email within 10 hours.`);
          }
        });
      });

      // res.send({ message: 'Please verify your email address withing 12 hours.' });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// Verify User by confirming token
export const confirm = (req, res, next) => {
  // console.log('$$$$$$ confirming....');

  Token.findOne({ token: req.params.token }, (err, token) => {
    if (!token) { return res.status(400).send(`We were unable to match your unique token. Your token may have expired. Visit our ${homepage}`); }

    User.findOne({ _id: token.user }, (err, user) => {
      if (!user) { return res.status(401).send(`We were unable to find a user for this token. Visit our ${homepage}`); }
      if (user.isVerified) { return res.status(400).send(`Your account was already verified.Visit our ${homepage}`); }

      // verify and save the user
      user.isVerified = true;
      user.save((err) => {
        if (err) { return res.status(500).send({ mess: err.message }); }
        res.status(200).send(`The account has been verified. Please ${signinpage}`);
      });
    });
  });
};

// Resending tokens for expired ones
export const resend = (req, res, next) => {
  // TODO add in normalize and checks for validationErrors

  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) { return res.status(410).send({ mess: 'We did not find a user matching the email you provided.' }); }
    if (user.isVerified) { return res.status(411).send({ mess: 'Your account is already verified.' }); }

    // create token, save and send emails
    const token = new Token({
      user: user._id,
      token: tokenForUser(user),
    });

    // save token
    token.save((err) => {
      if (err) { return res.status(500).send({ mess: err.message }); }

      // send verification email
      const mailOptions = {
        from: 'Sharity <sharitygive@gmail.com',
        to: user.email,
        subject: 'Verify Your Email Address',
        text: `Hi,\n\n Please verify your account by clicking the link: \nhttp://${req.headers.host}/api/confirmation/${token.token}\n`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log('error sending mail\n', 'info: ', info);
          return res.status(500).send({ mess: err.message });
        } else {
          res.status(200).send(`A verification email has been sent to ${user.email}. Please verify your email within 10 hours.`);
        }
      });
    });
  });
};
