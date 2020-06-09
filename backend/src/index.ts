import { Container } from 'typedi';
import SocketController from './services/SocketController';

const cors = require('cors');

const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 80; // Heroku dynos expose a dynamic port for your app to bind to
server.listen(PORT, () => {
  console.log(`Listening at ${PORT} port!`);
});

app.get('/', (req, res) => res.send('Hello World!')); // just regular get endpoint

app.use(cors());

// Dependencies container
Container.set('socket.io', io);

io.on('connection', socket => new SocketController(socket));
