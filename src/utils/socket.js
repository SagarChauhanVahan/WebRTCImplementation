import io from 'socket.io-client';

let socket;

const getSocket = () => {
  if (!socket) {
    console.log("first time connection")
    socket = io.connect('http://localhost:8400', {
        transports: ["websocket"]
      });
    console.log("socket from socket.js:>>", socket);
    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.toString());
        // You can add custom error handling logic here
      });
  }
  return socket;
};

export default getSocket;
