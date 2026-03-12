const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 1. FREE DATABASE CONNECTION (Replace with your MongoDB Atlas Link)
const mongoURI = "mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster.mongodb.net/chatDB";
mongoose.connect(mongoURI).then(() => console.log("Database Connected"));

// 2. DATABASE SCHEMA (How your messages look)
const msgSchema = new mongoose.Schema({ name: String, text: String, time: { type: Date, default: Date.now } });
const Message = mongoose.model('Message', msgSchema);

app.use(express.static('public'));

// 3. REAL-TIME LOGIC
io.on('connection', async (socket) => {
    // Send old messages from database when someone joins
    const logs = await Message.find().sort({ _id: 1 }).limit(50);
    socket.emit('load old msgs', logs);
    
    socket.on('send message', async (data) => {
        const newMsg = new Message(data);
        await newMsg.save(); // Save to free database
        io.emit('new message', data); // Broadcast to everyone
    });
});

server.listen(3000, () => console.log("Server on port 3000"));