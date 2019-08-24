const getSession = (socketId, connectedPlayers, sessions) => {
  const sessionId = connectedPlayers.get(socketId).get('sessionId');
  return sessions.get(sessionId);
};

exports.getSession = (socketId, connectedPlayers, sessions) => getSession(socketId, connectedPlayers, sessions);

exports.updateSessionPieces = (socketId, connectedPlayers, sessions, state) => {
  const sessionId = connectedPlayers.get(socketId).get('sessionId');
  const session = sessions.get(sessionId);
  const newSession = session.set('pieces', state.get('pieces')).set('discardedPieces', state.get('discardedPieces'));
  // console.log('@updateSessionPieces', newSession.getIn(['pieces', 0, 0]), session.getIn(['pieces', 0, 0]))
  return sessions.set(sessionId, newSession);
};

exports.updateSessionPlayerName = (socketId, connectedPlayers, sessions, index, name) => {
  const sessionId = connectedPlayers.get(socketId).get('sessionId');
  const session = sessions.get(sessionId);
  const newSession = session.setIn(['players', index, 'name'], name);
  return sessions.set(sessionId, newSession);
};

exports.getPlayerID = (socketId, connectedPlayers, sessions) => {
  const sessionId = connectedPlayers.get(socketId).get('sessionId');
  const session = sessions.get(sessionId);
  return session.get('connectedPlayers').get(socketId);
};

exports.getPlayerNameSession = (session, pid) => {
  return session.getIn(['players', pid, 'name']);
}

exports.getPlayerName = (socketId, connectedPlayers, sessions) => {
  const sessionId = connectedPlayers.get(socketId).get('sessionId');
  const session = sessions.get(sessionId);
  const id = session.get('connectedPlayers').get(socketId);
  return session.getIn(['players', id, 'name'])
};

exports.findSocketId = (session, pid) => {
  const sessionPlayers = session.get('connectedPlayers');
  const iter = sessionPlayers.keys();
  let temp = iter.next();
  while (!temp.done) {
    const socketId = temp.value;
    if (sessionPlayers.get(socketId) === pid) {
      return socketId;
    }
    temp = iter.next();
  }
  return -1;
};
