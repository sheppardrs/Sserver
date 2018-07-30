import Post from '../models/post_model';

// number of characters to select from content for listing preview
const previewLen = 100;
const numPosts = 20;

export const createPost = (req, res) => {
  const post = new Post();
  post.title = req.body.title;
  post.tags = req.body.tags;
  post.content = req.body.content;
  post.location = req.body.location;
  post.request = req.body.request;
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
  // Post.find({}, 'id title tags cover_url likes location request').sort([['_id', -1]]).then((posts) => {
  //   res.send(posts);
  // });
  // console.log('#########', req.body.filter);
  // get the first 20 posts by id, title, tags, cover_url, likes, and content:
  // the content is cut to the first 200 characters
  Post.aggregate([
    { $limit: numPosts },
    {
      $project: {
        id: '$_id', title: 1, tags: 1, cover_url: 1, likes: 1, location: 1, request: 1, preview: { $substr: ['$content', 0, previewLen] },
      },
    },
    { $sort: { _id: -1 } },
  ]).then((posts) => {
    res.send(posts);
  });
};

export const getFilteredPosts = (req, res) => {
  // console.log('######', req.body);
  let Sort;
  // can condense down to
  // Sort = { $sort: { req.body.sort: 1 } };
  // if want all ascending and will keep client and Server
  // field names the same
  if (req.body.sort === 'trending') {
    Sort = { $sort: { likes: -1 } };
  } else if (req.body.sort === 'title') {
    Sort = { $sort: { title: 1 } };
  } else if (req.body.sort === 'tags') {
    Sort = { $sort: { tags: 1 } };
  } else if (req.body.sort === 'location') {
    Sort = { $sort: { location: 1 } };
  } else {
    Sort = { $sort: { _id: -1 } };
  }


  Post.aggregate([
    { $limit: numPosts },
    {
      $project: {
        id: '$_id', title: 1, tags: 1, cover_url: 1, likes: 1, location: 1, request: 1, preview: { $substr: ['$content', 0, previewLen] },
      },
    },
    Sort,
  ]).then((posts) => {
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
        location: req.body.location,
        tags: req.body.tags,
        request: req.body.request,
      }).then((newpost) => {
        res.send(newpost);
      });
    } else {
      // console.log('################################');
      res.status(610);
    }
  });
};


export const likePost = (req, res) => {
  // console.log('######## adding a like####### ');
  Post.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true }, (error, response) => {
    if (error) {
      res.status(530).json({ error });
    } else {
      res.send(response);
    }
  });
};
