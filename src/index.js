

const express = require('express');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const router = express.Router();
const cors = require('cors');

const pawns = require('./pawns');
const SocketController = require('./socketcontroller.js');

// we will use port 8000 for our app
server.listen(8000, () => console.log('connected to port 8000!'));

app.use('/', router);
app.use(cors());


router.all('*', cors());


const monstersJSON = pawns.getMonsterMap();

const getMonstersJson = async () => monstersJSON;

router.get('/unitJson', async (req, res) => {
  console.log('/unitJson GET Request - ', req.connection.remoteAddress);
  const mosntersJSON = await getMonstersJson();
  res.json({ mosntersJSON });
});

io.on('connection', (socket) => {
  console.log('io on connection', socket.id);
  const socketController = new SocketController(socket, io);
  socketController.onConnection();
});
