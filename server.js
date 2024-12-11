// Import required modules
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Create an Express app
const app = express();

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = new Server(server);

// Serve static files (like index.html) from the 'public' folder
app.use(express.static('public'));

// Store active users in an array
let users = [];  // Array to store active users

// Listen for incoming socket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle when a user joins
    socket.on('user joined', (username) => {
        socket.username = username;  // Store the username in the socket object
        users.push(username);  // Add the user to the active users list
        io.emit('user joined', username);  // Notify everyone when a user joins
        io.emit('update users', users);  // Send the updated user list to all clients
    });

    // Handle incoming chat messages
    socket.on('chat message', (data) => {
        const timestamp = new Date().toLocaleTimeString();  // Get the current time for timestamp
        // Broadcast the message along with the timestamp to all connected clients
        io.emit('chat message', { ...data, timestamp });
    });

    // Handle typing event
    socket.on('typing', () => {
        socket.broadcast.emit('typing', socket.username);  // Broadcast typing event to other users
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log(`${socket.username || 'A user'} disconnected`);

        // Remove the user from the active users list
        users = users.filter(user => user !== socket.username);
        
        // Update the user list for all clients
        io.emit('update users', users);
        
        // Notify everyone that the user has left
        io.emit('user left', socket.username);
    });
});

// Start the server and listen on port 3000
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
