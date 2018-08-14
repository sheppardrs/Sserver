import Post from '../models/post_model';
import User from '../models/user_model';
import Conversation from '../models/conversation_model';

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
  // console.log('###### req.body', req.body);
  // if search => search if not sort and filter
  console.log('###### search term:', req.body.search, 'that was it');
  if (req.body.search !== '') {
    // console.log('actually got a search term here wooohooo!!!!!');
    Post.aggregate([
      { $match: { $text: { $search: req.body.search } } },
      { $sort: { score: { $meta: 'textScore' } } },
      { $limit: numPosts },
      {
        $project: {
          id: '$_id', title: 1, tags: 1, cover_url: 1, likes: 1, location: 1, request: 1, preview: { $substr: ['$content', 0, previewLen] },
        },
      },
    ]).then((posts) => {
      res.send(posts);
    });
  } else { // not searching just getting filtered and sorted posts
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
    // console.log('got nothing for that search');
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
  }
};

export const getPost = (req, res) => {
  Post.findById(req.params.id).populate('author', 'username').then((post) => {
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
  // console.log('starting update');
  Post.findById(req.params.id).then((post) => {
    // console.log('editing...');
    if (req.user._id.equals(post.author)) {
      // console.log('matched author to user');
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
      res.status(410).json({ error: 'not authorized to edit, must be author.' });
    }
  });
};


export const likePost = (req, res) => {
  // console.log('######## adding a like####### ');
  // console.log(req.user);
  Post.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true }, (error, response) => {
    if (error) {
      res.status(530).json({ error });
    } else {
      res.send(response);
    }
  });
};

// check if there are any unseen Messages
export const getNotifications = (req, res) => {
  // console.log('checking for new messages', req.user._id);
  User.findById(req.user._id).then((user) => {
    // console.log('searching for unseen for: ', user.username);
    Conversation.find({ unseen: user.username }).then((convos) => {
      res.send({ newMess: convos.length });
    }).catch((err) => { return console.log('error in fetching unseen conversations', err); });
  }).catch((err) => { console.log('error in fetching user for checking unseen convos', err); });
};
