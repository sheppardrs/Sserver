import Post from '../models/post_model';

export const createPost = (req, res) => {
  const post = new Post();
  post.title = req.body.title;
  post.tags = req.body.tags;
  post.content = req.body.content;
  post.cover_url = req.body.cover_url;
  post.author = req.user;

  post.save()
    .then((result) => {
      res.json(post);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

export const getPosts = (req, res) => {
  Post.find({}, 'id title tags cover_url likes').sort([['_id', -1]]).then((posts) => {
    res.send(posts);
  });
};

export const getPost = (req, res) => {
  Post.findById(req.params.id).then((post) => {
    // console.log(post._id.getTimestamp());
    res.send(post);
  });
};

export const deletePost = (req, res) => {
  Post.findById(req.params.id).then((post) => {
    if (req.user._id.equals(post.author)) {
      post.remove();
      res.send(post);
    } else {
      // console.log('################################');
      res.status(450);
    }
  });
  // delete without checking author
  // Post.findByIdAndDelete(req.params.id).then((post) => {
  //   res.send(post);
  // });
};

export const updatePost = (req, res) => {
  Post.findById(req.params.id).then((post) => {
    if (req.user._id.equals(post.author)) {
      Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        content: req.body.content,
        cover_url: req.body.cover_url,
        tags: req.body.tags,
      }).then((newpost) => {
        res.send(newpost);
      });
    } else {
      // console.log('################################');
      res.status(610);
    }
  });

  // Post.findByIdAndUpdate(req.params.id, {
  //   title: req.body.title,
  //   content: req.body.content,
  //   cover_url: req.body.cover_url,
  //   tags: req.body.tags,
  // }).then((newpost) => {
  //   res.send(newpost);
  // });
};


export const likePost = (req, res) => {
  console.log('######## adding a like####### ');
  Post.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true }, (error, response) => {
    if (error) {
      res.status(530).json({ error });
    } else {
      res.send(response);
    }
  });
};
