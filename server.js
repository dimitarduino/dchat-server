const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const usersRoute = require('./routes/usersRoute'); 
const registerRoute = require('./routes/registerRoute');
const groupsRoute = require('./routes/groupsRoute');
const messagesRoute = require('./routes/messagesRoute');

//middleware
app.use(cors());
app.use(express.json());
app.use("/users", usersRoute);
app.use("/register", registerRoute);
app.use("/groups", groupsRoute);
app.use('/messages', messagesRoute);

//db
const uri = 'mongodb://localhost:27017/dchat';
mongoose.connect(uri, {
    useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true
});
const connection = mongoose.connection;
connection.once("open", () => { console.log("Mongo database established successfully") });

//test route
app.get("/", (req, res) => {
    res.send("Hii");
})

// kreni sockets
io.on('connection', (socket) => {
    console.log('nov korisnik');
    socket.on('join', (grupaId, korisnici) => {
        console.log('join');
    })
    socket.on("novaPoraka", (msgContent) => {   
        console.log('nova poraka');
    })
})
io.listen(8000);


//kreni server
server.listen(port, () => {
    console.log('Server running on port ' + port);
})