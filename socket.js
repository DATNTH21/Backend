const socketIO = require("socket.io");
let io = null;

module.exports = {
  initializeSocket: (httpServer, options) => {
    io = socketIO(httpServer, options);
    return io;
  },
  getIO: () => {
    if (!io) return null;
    return io;
  },
};
