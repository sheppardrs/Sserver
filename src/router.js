import { Router } from 'express';
import dotenv from 'dotenv';

// for sending emails
import { createTransport } from 'nodemailer';

import * as Posts from './controllers/post_controller';
import * as UserController from './controllers/user_controller';
import { requireAuth, requireSignin } from './services/passport';


const router = Router();

dotenv.config();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to our blog api!' });
});

// routes
// note here that patch is used for filtering and sorting
// as the server has to receive a body with what to select
router.route('/posts')
  .post(requireAuth, Posts.createPost)
  .get(Posts.getPosts)
  .patch(Posts.getFilteredPosts);

router.route('/posts/:id')
  .get(Posts.getPost)
  .put(requireAuth, Posts.updatePost)
  .delete(requireAuth, Posts.deletePost)
  .patch(Posts.likePost);

router.post('/signin', requireSignin, UserController.signin);

router.post('/signup', UserController.signup);

function sendTestEmail() {
  // Sending an email:
  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'blah@gmail.com',
    to: 'sharitygive@gmail.com',
    subject: 'Punked',
    html: 'Hey, Love ya!',
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log('#########Hey Yo Error:', err);
    } else {
      console.log('!!!!!!!!!! succeeded. Wooohoooo!!!');
    }
  });
}

// for email verification
router.get('/confirmation/:token', UserController.confirm);
router.post('/resend', UserController.resend);

//  for password reset
router.post('/resetpasswordreq', UserController.resetpasswordreq);
router.post('/resetpassword', UserController.resetpassword);


export default router;
