import Message from './models/message_model';
import Conversation from './models/conversation_model';
import User from './models/user_model';

const socketManager = (socket, websocket) => {
  // console.log('A Client just connected on ', socket.id);

  // socket.emit('messages', );

  let UserName;
  let currConversation; // conversation should be full item

  // join with username so add socket to user db
  socket.on('join', (user) => {
    console.log('got username: ', user, 'on: ', socket.id);
    User.findOneAndUpdate({ username: user }, { socket: socket.id }).then((newUser) => {
      // this is unnecessary for now
      UserName = user;
      Conversation.find({ participants: UserName }).then((conversations) => {
        socket.emit('convos', conversations);
      });

      // Message.find({ to: UserName }).then((messages) => {
      //   // console.log(messages);
      //   socket.emit('messages', messages);
      // });
      // socket.emit('message', { from: 'server', content: 'You are online.', _id: 1 });
    }).catch((err) => {
      console.log('Error in adding socket to user', err);
    });
  });

  // change the conversation to the one rec
  // send the relavent messages
  // TODO: add the sockets to the room of that convo
  // or do this on connection
  socket.on('convo', (convo) => {
    currConversation = convo;
    console.log('Received convo request: ', convo);
    Message.find({ to: currConversation._id }).then((messages) => {
      socket.emit('messages', messages);
    }).catch((err) => {
      console.log('Error in fetching conversation: ', err);
    });
  });
  // socket.emit('message', { username: 'server', content: 'Hello World!' });

  // start a conversation with a given user
  socket.on('startconvo', (username) => {
    const newconvo = new Conversation();
    newconvo.participants.push(username); // received to
    newconvo.participants.push(UserName); // current user (from)

    newconvo.save().then((saveRes) => {
      currConversation = saveRes;
      console.log('created new conversation: ', saveRes);
      // TODO: send new list of conversations to relevant users
    });
  });

  // TODO: conversation helper
  // find conversations for user

  // receive a message, save message, send out message
  socket.on('message', (message) => {
    // console.log('received: ', message);

    // store the message in database
    const saveMess = new Message();
    saveMess.from = message.from;
    saveMess.content = message.content;
    saveMess.to = message.to;
    saveMess.save()

      .then((saveRes) => {
        // send to everyone
        // websocket.emit('message', saveRes);
        // adding sending to specific recipient
        // send back to sender
        // socket.emit('message', saveRes);

        // TODO: use a room instead of the map and find
        // room should just be the conversation._id
        Conversation.findById(saveRes.to._id).then((convo) => {
          console.log('found conversation: ', convo);
          convo.participants.map((user) => {
            User.findOne({ username: user }).then((recipient) => {
              // console.log('found:', recipient.socket);
              if (recipient && (recipient.socket !== 0)) {
              //   console.log('trying to send to ', recipient.socket);
                websocket.to(recipient.socket).emit('message', saveRes);
              }
            }).catch((err) => {
              console.log('error in finding username to send to: ', err);
            });
            return true;
          });
        });

        // old, for non conversation based messaging
        // User.findOne({ username: saveRes.to }).then((recipient) => {
        //   // console.log('found:', recipient.socket);
        //   if (recipient && (recipient.socket !== 0)) {
        //   //   console.log('trying to send to ', recipient.socket);
        //     websocket.to(recipient.socket).emit('message', saveRes);
        //   }
        // }).catch((err) => {
        //   console.log('error in finding username to send to: ', err);
        // });
      })
      .catch((error) => {
        console.log('error in saving message', error);
      });


    // send the message to everyone including the sender
    // websocket.emit('message', message);
  });
  socket.on('disconnect', (sockett) => {
    console.log('Disconnected: ', sockett, UserName);
    User.findOneAndUpdate({ username: UserName }, { socket: 0 }).then((res) => {
      console.log('set socket to 0 for ', UserName);
    }).catch((err) => {
      console.log('error in setting socket to 0', err);
    });
  });
};

export default socketManager;
