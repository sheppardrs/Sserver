import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import mongoose from 'mongoose';
import io from 'socket.io';
import http from 'http';
// import dotenv from 'dotenv';
import apiRouter from './router';
// dotenv variables
// dotenv.config({ silent: true });

// for socket.io management
import socketManager from './socketFunc';

// initialize
const app = express();
// adding in chat sockets?
const server = http.createServer(app);
const websocket = io.listen(server);

// server.listen(3000, () => { return console.log('listening on *:3000'); });

// websocket.on('connection', (socket) => {
//   socketManager(socket, websocket);
// });

// enable/disable cross origin resource sharing if necessary
app.use(cors());

// enable/disable http request logging
app.use(morgan('dev'));

// enable only if you want templating
app.set('view engine', 'ejs');

// enable only if you want static assets from folder static
app.use(express.static('static'));

// this just allows us to render ejs from the ../app/views directory
app.set('views', path.join(__dirname, '../src/views'));

// enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// DB Setup
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/blog';
mongoose.connect(mongoURI);
// set mongoose promises to es6 default
mongoose.Promise = global.Promise;

app.use('/api', apiRouter);

// default index route
app.get('/', (req, res) => {
  res.send('hi');
});

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
// app.listen(port);

// app.listen(port);

server.listen(process.env.PORT || 3000);


websocket.on('connection', (socket) => {
  socketManager(socket, websocket);
});

console.log(`listening on: ${port}`);
