import Message from './models/message_model';

const socketManager = (socket, websocket) => {
  // console.log('A Client just connected on ', socket.id);
  Message.find().then((messages) => {
    // console.log(messages);
    socket.emit('messages', messages);
  });
  // socket.emit('messages', );

  // socket.emit('message', { username: 'server', content: 'Hello World!' });
  socket.on('message', (message) => {
    console.log('received: ', message);

    // store the message in database
    const saveMess = new Message();
    saveMess.from = message.from;
    saveMess.content = message.content;
    saveMess.save()
      .then((saveRes) => {
        websocket.emit('message', saveRes);
      })
      .catch((error) => {
        console.log('error in saving message', error);
      });


    // send the message to everyone including the sender
    // websocket.emit('message', message);
  });
  socket.on('disconnect', (sockett) => {
    console.log('Disconnected: ', sockett);
  });
};

export default socketManager;
