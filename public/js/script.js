const socket = io();
let username;

socket.on("connect", () => {
    username = prompt("Enter your username:");
    if (username) {
        socket.emit("enter_room", "general", username);
    } else {
        alert("username cant be empty.");
    }
});

window.onload = () => {
    document.querySelector("form").addEventListener("submit", (e) => {
        e.preventDefault();
        const messageInput = document.querySelector("#message");
        const room = document.querySelector("#tabs li.active").dataset.room;
        const createdAt = new Date();

        const messageValue = messageInput.value.trim();
        if (messageValue !== "") {
            socket.emit("chat_message", {
                name: username,
                message: messageValue,
                room: room,
                createdAt: createdAt
            });

            document.querySelector("#message").value = "";
        } else {
            alert("message cant be empty.");
        }
    });

    socket.on("received_message", (msg) => {
        sendMessages(msg);
    });

    document.querySelectorAll("#tabs li").forEach(function(tab) {
        tab.addEventListener("click", function() {
            if (!this.classList.contains("active")) {
                const active = document.querySelector("#tabs li.active");
                active.classList.remove("active");
                this.classList.add("active");
                document.querySelector("#messages").innerHTML = "";
                socket.emit("leave_room", active.dataset.room);
                socket.emit("enter_room", this.dataset.room);
            }
        });
    });    

    socket.on("init_messages", msg => {
        let data = JSON.parse(msg.messages);
        if(data != []){
            data.forEach(data => {
                sendMessages(data);
            });
        }
    });

    document.querySelector("#message").addEventListener("input", () => {
        const room = document.querySelector("#tabs li.active").dataset.room;

        socket.emit("typing", {
            name: username,
            room: room
        });
    });

    socket.on("usertyping", msg => {
        const writing = document.querySelector("#writing");

        writing.innerHTML = `${msg.name} is typing..`;

        setTimeout(function(){
            writing.innerHTML = "";
        }, 5000);
    });
};

function sendMessages(msg){
    let created = new Date(msg.createdAt);
    let texte = `<div><p>${msg.name} <small>${created.toLocaleDateString()}</small></p><p>${msg.message}</p></div>`;

    document.querySelector("#messages").innerHTML += texte;
}
