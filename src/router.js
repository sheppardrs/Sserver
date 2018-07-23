import { Router } from 'express';
import dotenv from 'dotenv';
import * as Posts from './controllers/post_controller';
import * as UserController from './controllers/user_controller';
import { requireAuth, requireSignin } from './services/passport';

const router = Router();

dotenv.config();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to our blog api!' });
});

// routes will go here
router.route('/posts')
  .post(requireAuth, Posts.createPost)
  .get(Posts.getPosts);

router.route('/posts/:id')
  .get(Posts.getPost)
  .put(requireAuth, Posts.updatePost)
  .delete(requireAuth, Posts.deletePost)
  .patch(Posts.likePost);

router.post('/signin', requireSignin, UserController.signin);

router.post('/signup', UserController.signup);

export default router;
