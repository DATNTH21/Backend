const socketIO = require("socket.io");
let io = null;

module.exports = {
  initializeSocket: (httpServer, options) => {
    io = socketIO(httpServer, options);

    io.on("connection", (socket) => {
      console.log("New socket connection:", socket.id);
      const { userId } = socket.handshake.auth;

      socket.join(`user:${userId}`);

      socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected`);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      console.error("Socket.io not initialized");
      return null;
    }
    return io;
  },
};
