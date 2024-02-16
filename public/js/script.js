const socket = io();

socket.on("connect", () => {
    socket.emit("enter_room", "general");
});