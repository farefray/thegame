import { Container } from 'typedi';
import SocketController from './services/SocketController';

const express = require('express');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const router = express.Router();
const cors = require('cors');

// we will use port 8000 for our app
server.listen(8000, () => {
  console.log('connected to port 8000!');
});

app.use('/', router);
app.use(cors());

router.all('*', cors());

// Dependencies
Container.set('socket.io', io);

io.on('connection', socket => new SocketController(socket));
