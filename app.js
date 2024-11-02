// const express = require('express');
// const app=express();
// const path=require("path");

// const http=require("http");
// const socketio=require("socket.io");

// const server = http.createServer(app);
// const io= socketio(server);

// app.set("view engine","ejs");
// app.use(express.static(path.join(__dirname,"public")));

// //connection goes here 
// io.on("connection",function(socket){
//     console.log("connected",socket.id);

//     //need to accept location 
//     socket.on("send-location",function(data){
//         console.log("Location received:", data); // Debug log
//         io.emit("receive-location",{
//             id: socket.id, 
//             latitude: data.latitude,
//             longitude: data.longitude
//         });
//     });

//     //disconnect 
//     socket.on("disconnect",function(data){
//         io.emit("user-disconnected",socket.id);
//     });
// });

// app.get("/",function(req,res){
//     res.render("index");
// })

// const PORT = 3000;
// server.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const path = require('path');

// Set up Express
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

// Socket.IO
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('send-location', (data) => {
        console.log('Location received from', socket.id, ':', data);
        io.emit('receive-location', {
            id: socket.id,
            ...data
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        io.emit('user-disconnected', socket.id);
    });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});