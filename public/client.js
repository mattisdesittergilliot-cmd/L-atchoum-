// client.js

const socket = io('http://localhost:3000'); // Connect to the server

// Listen for connection
socket.on('connect', () => {
    console.log('Connected to the server');
});

// Listen for messages from the server
socket.on('message', (data) => {
    console.log('Message from server:', data);
});

// Sending a message to the server
function sendMessage(message) {
    socket.emit('message', message);
}

// Example usage
sendMessage('Hello from the client!');