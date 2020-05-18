import { Container } from 'typedi';
import SocketController from './services/SocketController';

const express = require('express');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const cors = require('cors');

const PORT = process.env.PORT || 80; // Heroku dynos expose a dynamic port for your app to bind to
server.listen(PORT, () => {
  console.log(`Connected at ${PORT} port!`);
});

app.get('/', (req, res) => res.send('Hello World!'))

app.use(cors());

// router.all('*', cors());

// Dependencies
Container.set('socket.io', io);

io.on('connection', socket => new SocketController(socket));
