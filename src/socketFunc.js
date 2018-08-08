import Message from './models/message_model';
import Conversation from './models/conversation_model';
import User from './models/user_model';

const socketManager = (socket, websocket) => {
  // console.log('A Client just connected on ', socket.id);

  // socket.emit('messages', );

  let UserName;
  let currConversation; // conversation should be full item

  // TODO: conversation helper
  // find conversations for user and add user to corresponding rooms
  const findConvosHelper = () => {
    Conversation.find({ participants: UserName }).sort('-createdAt').then((conversations) => {
      socket.emit('convos', conversations); // send the list of conversations
      // add socket to all the relevant rooms
      conversations.map((conversation) => {
        socket.join(conversation._id);
        return true;
      });
    });
  };

  // join with username so add socket to user db
  socket.on('join', (user) => {
    console.log('got username: ', user, 'on: ', socket.id);
    User.findOneAndUpdate({ username: user }, { socket: socket.id }).then((newUser) => {
      // this is unnecessary for now
      UserName = user;
      // find & send convos and join rooms
      findConvosHelper(UserName);
    }).catch((err) => {
      console.log('Error in adding socket to user', err);
    });
  });

  // change the conversation to the one rec
  // send the relavent messages
  socket.on('convo', (convo) => {
    currConversation = convo;
    // console.log('Received convo request: ', convo);
    Message.find({ to: currConversation._id }).sort('createdAt').then((messages) => {
      socket.emit('messages', messages);
    }).catch((err) => {
      console.log('Error in fetching conversation: ', err);
    });
    // redundant
    // socket.join(currConversation._id);
  });
  // socket.emit('message', { username: 'server', content: 'Hello World!' });

  // start a conversation with a given user
  socket.on('startconvo', (toUsername) => {
    const newconvo = new Conversation();
    newconvo.participants.push(toUsername); // received (to)
    newconvo.participants.push(UserName); // current user (from)
    newconvo.title = `${toUsername} & ${UserName}`; // TODO make title post title or ref
    // check that the toUsername exists
    User.findOne({ username: toUsername }).then((user) => {
      if (user !== null) {
        newconvo.save().then((saveRes) => {
          currConversation = saveRes;
          // console.log('created new conversation: ', saveRes);
          // TODO: send new list of convos to sender and send alert to get convos to recipient
          findConvosHelper(UserName);
          //  User.findOne({ username: toUsername }).then((user) => {
          // console.log('sending newConvo to: ', user);
          websocket.to(user.socket).emit('newConvo');
          // /}).catch((err) => { console.log('error in finding user to alert of new conversation.', err); });
        }).catch((err) => { console.log('error in startconvo with saving convo', err); });
      }
    });
  });


  // receive a message, save message, send out message
  socket.on('message', (message) => {
    // store the message in database
    const saveMess = new Message();
    saveMess.from = message.from;
    saveMess.content = message.content;
    saveMess.to = message.to;
    saveMess.save()
      .then((saveRes) => {
        // room should just be the conversation._id
        Conversation.findById(saveRes.to._id).then((convo) => {
        //  console.log('found conversation: ', convo);
          websocket.to(convo._id).emit('message', saveRes);
        });
      })
      .catch((error) => {
        console.log('error in saving message', error);
      });
  });


  socket.on('disconnect', (sockett) => {
    // TODO: UserName is always undefined here
    // console.log('Disconnected: ', sockett, UserName);
    User.findOneAndUpdate({ username: UserName }, { socket: 0 }).then((res) => {
      // console.log('set socket to 0 for ', UserName);
    }).catch((err) => {
      console.log('error in setting socket to 0', err);
    });
  });
};

export default socketManager;
