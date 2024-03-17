const websocketProtocol = window.location.protocol === "https:" ? "wss" : "ws";
const wsEndpoint = `${websocketProtocol}://${window.location.host}/ws/notification/`;
const socket = new WebSocket(wsEndpoint);

socket.onopen = (event) => {
    console.log("WebSocket connection opened!");
};

socket.onclose = (event) => {
    console.log("WebSocket connection closed!");
};



document.getElementById('room_form').addEventListener('submit', function (event) {
    // event.preventDefault();
    var ufoName = document.getElementById('room_name').value;
    var astronautName = document.getElementById('username').value;
    console.log("UFO Name:", ufoName);
    console.log("Astronaut Name:", astronautName);
    socket.send(
        JSON.stringify({
            'room_id': ufoName,
            'user_name': astronautName,
        })
    )
});