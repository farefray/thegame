

const express = require('express');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const router = express.Router();
const cors = require('cors');

const deckJS = require('./deck');
const pawns = require('./pawns');
const socketController = require('./socketcontroller.js');

// we will use port 8000 for our app
server.listen(8000, () => console.log('connected to port 8000!'));

app.use('/', router);
app.use(cors());


router.all('*', cors());

const spritesJSON = pawns.getMonsterSprites();
const monstersJSON = pawns.getMonsterMap();

const getSprites = async () => spritesJSON;
const getMonstersJson = async () => monstersJSON;

router.get('/sprites', async (req, res) => {
  console.log('/sprites GET Request - ', req.connection.remoteAddress);
  const sprites = await getSprites();
  // Added delay for responses(TODO remove me after tests)
  setTimeout(() => res.json({ sprites }), 0);
});

router.get('/unitJson', async (req, res) => {
  console.log('/unitJson GET Request - ', req.connection.remoteAddress);
  const mosntersJSON = await getMonstersJson();
  res.json({ mosntersJSON });
});

io.on('connection', (socket) => {
  socketController(socket, io);
});
