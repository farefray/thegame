import io from 'socket.io-client';

let endpoint = process.env.NODE_ENV === 'production' ? 'https://thegame-backend.herokuapp.com/' : 'http://' + window.location.href.split(':3000')[0].split('http://')[1] + '';

// todo test if we use longpolling or sockets?
const socket = io(endpoint); // io.connect(endpoint);
export default socket;

export const emitMessage = (type, payload?) => {
  return new Promise((resolve, reject) => {
    socket.emit(type, payload, (response) => {
      if (response.ok) {
        return resolve(response);
      }

      return reject(response);
    });
  });
};
