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

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

io.on("connection", (socket) => {
    console.log('User connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('enter_room', (room) => {
        socket.join(room);
        console.log(socket.rooms);

        Chat.findAll({
            attributes: ['id', 'name', 'message', 'room', 'createdAt'],
            where: {
                room: room
            }
        }).then(list => {
            socket.emit("init_messages", {messages: JSON.stringify(list)});
        });
    });

    socket.on('leave_room', (room) => {
        socket.leave(room);
        console.log(socket.rooms);
    });

    socket.on('chat_message', (msg) => {
        const message = Chat.create({
            name: msg.name,
            message: msg.message,
            room: msg.room,
            createdAt: msg.createdAt
        }).then(() => {
            io.in(msg.room).emit('received_message', msg);
        }).catch(e => {
            console.log(e);
        });    
    });

    socket.on('typing', msg => {
        socket.to(msg.room).emit('usertyping', msg);
    })
});

server.listen(port, () => {
    console.log(`server running at : http://127.0.0.1:${port}`);
});