// State management for socket rooms (active poll counts etc)
const roomStudents = new Map(); // roomCode -> Set of socketId

function setupSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Room Management
    socket.on("room:join", ({ roomCode }) => {
      socket.join(roomCode);
      if (!roomStudents.has(roomCode)) {
        roomStudents.set(roomCode, new Set());
      }
      roomStudents.get(roomCode).add(socket.id);
      
      // Update student count for everyone in room (including teacher)
      io.to(roomCode).emit("room:student-count", {
        count: roomStudents.get(roomCode).size,
      });
      console.log(`Socket ${socket.id} joined room ${roomCode}`);
    });

    // Teacher emits: poll:start
    socket.on("poll:start", ({ roomCode, poll }) => {
      console.log(`Poll started in ${roomCode}`);
      // Notify everyone in the room (primarily students)
      io.to(roomCode).emit("poll:start", poll);
    });

    // Teacher emits: poll:stop
    socket.on("poll:stop", ({ roomCode }) => {
      console.log(`Poll stopped in ${roomCode}`);
      io.to(roomCode).emit("poll:stop");
    });

    // Student emits: vote:cast
    socket.on("vote:cast", ({ roomCode, pollId, results }) => {
      console.log(`Vote cast in ${roomCode} for poll ${pollId}`);
      
      // 1. Confirm to the student who voted
      socket.emit("vote:confirmed", { pollId });

      // 2. Broadcast live results update to everyone in the room
      // results:live sends the latest summary to all clients
      io.to(roomCode).emit("results:live", { results });
      
      // results:update is also mentioned in spec for "broadcasts new vote counts"
      io.to(roomCode).emit("results:update", { results });
    });

    socket.on("disconnecting", () => {
      for (const roomCode of socket.rooms) {
        if (roomStudents.has(roomCode)) {
          roomStudents.get(roomCode).delete(socket.id);
          io.to(roomCode).emit("room:student-count", {
            count: roomStudents.get(roomCode).size,
          });
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = { setupSocketHandlers };
