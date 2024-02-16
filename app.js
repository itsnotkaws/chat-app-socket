const express = require("express");
const app = express();
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const Sequelize = require("sequelize");
const port = 3000;

const dbPath = path.resolve(__dirname, 'db.sqlite');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: dbPath
});

const Chat = require("./Models/Chat")(sequelize, Sequelize.DataTypes);
Chat.sync();

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(port, () => {
    console.log(`server running at : http://127.0.0.1:${port}`);
});