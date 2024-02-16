const socket = io();

socket.on("connect", () => {
    socket.emit("enter_room", "general");
});

window.onload = () => {
    document.querySelector("form").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.querySelector("#name")
        const message = document.querySelector("#message");
        const room = document.querySelector("#tabs li.active").dataset.room;
        const createdAt = new Date();

        socket.emit("chat_message", {
            name: name.value,
            message: message.value,
            room: room,
            createdAt: createdAt
        });

        document.querySelector("#message").value = "";
    });

    socket.on("received_message", (msg) => {
        sendMessages(msg);
    })

    document.querySelectorAll("#tabs li").forEach(function(tab) {
        tab.addEventListener("click", function() {
            if (!this.classList.contains("active")) {
                const actif = document.querySelector("#tabs li.active");
                actif.classList.remove("active");
                this.classList.add("active");
                document.querySelector("#messages").innerHTML = "";
                socket.emit("leave_room", actif.dataset.room);
                socket.emit("enter_room", this.dataset.room);
            }
        });
    });
    
    socket.on("init_messages", msg => {
        let data = JSON.parse(msg.messages);
        if(data != []){
            data.forEach(data => {
                sendMessages(data);
            })
        }
    });
}

function sendMessages(msg){
    let created = new Date(msg.createdAt);
    let texte = `<div><p>${msg.name} <small>${created.toLocaleDateString()}</small></p><p>${msg.message}</p></div>`

    document.querySelector("#messages").innerHTML += texte;
}