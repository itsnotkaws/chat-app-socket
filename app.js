const express = require("express");
const app = express();
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const port = 3000;

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

io.on("connection", (socket) => {
    console.log('User connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(port, () => {
    console.log(`server running at : http://127.0.0.1:${port}`);
});