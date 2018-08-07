import Message from './models/message_model';
import User from './models/user_model';

const socketManager = (socket, websocket) => {
  // console.log('A Client just connected on ', socket.id);

  // socket.emit('messages', );

  let UserName;

  // join with username so add socket to user db
  socket.on('join', (user) => {
    console.log('got username: ', user, 'on: ', socket.id);
    User.findOneAndUpdate({ username: user }, { socket: socket.id }).then((newUser) => {
      // this is unnecessary for now
      UserName = user;
      Message.find({ to: UserName }).then((messages) => {
        // console.log(messages);
        socket.emit('messages', messages);
      });
      // socket.emit('message', { from: 'server', content: 'You are online.', _id: 1 });
    }).catch((err) => {
      console.log('Error in adding socket to user', err);
    });
  });

  // socket.emit('message', { username: 'server', content: 'Hello World!' });

  socket.on('message', (message) => {
    console.log('received: ', message);

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
        socket.emit('message', saveRes);
        User.findOne({ username: saveRes.to }).then((recipient) => {
          console.log('found:', recipient.socket);
          if (recipient && (recipient.socket !== 0)) {
            console.log('trying to send to ', recipient.socket);
            websocket.to(recipient.socket).emit('message', saveRes);
          }
        }).catch((err) => {
          console.log('error in finding username to send to: ', err);
        });
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
