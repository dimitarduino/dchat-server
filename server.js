const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL : "http://localhost:3000",
        methods: ["GET", "POST"]
      }
});
const usersRoute = require('./routes/usersRoute');
const registerRoute = require('./routes/registerRoute');
const groupsRoute = require('./routes/groupsRoute');
const messagesRoute = require('./routes/messagesRoute');

//middleware
app.use(cors());
app.use(express.json());
app.use("/auth", usersRoute);
app.use("/register", registerRoute);
app.use("/groups", groupsRoute);
app.use('/messages', messagesRoute);

//db
const uri = process.env.ATLAS_URI ? process.env.ATLAS_URI : 'mongodb://localhost:27017/dchat';
mongoose.connect(uri, {
    useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true
});

const connection = mongoose.connection;
connection.once("open", () => { 
    console.log("Mongo database established successfully")
});

//test route
app.get("/", (req, res) => {
    res.send("Hii");
})

// kreni sockets
io.on('connection', (socket) => {
    socket.on('join', (grupaId, korisnici) => {
        if (Array.isArray(grupaId)) {
            grupaId.push(korisnici);
            socket.join(grupaId);
            socket.to(grupaId).broadcast.emit('userConnected', korisnici);
        } else {
            console.log('ne e array');
            console.log(korisnici);
            let grupi = [grupaId, korisnici];
            socket.join(grupi);
            socket.to(grupi).broadcast.emit('userConnected', korisnici);
        }
    })
    socket.on("novaPoraka", (msgContent) => {
        const { poraka, grupa, isprakjac, korisniciPoraka, novaGrupa } = msgContent;

        console.log(msgContent);
        if (novaGrupa) {
        korisniciPoraka.forEach(korisnik => {
            io.to(korisnik).emit('nacrtajPoraka', poraka, grupa, isprakjac);
        })
  
        } else {
            console.log(`New message: ${JSON.stringify(msgContent)}`);
            io.to(grupa).emit('nacrtajPoraka', poraka, grupa, isprakjac);
        }
    })

    //seen 
    socket.on("seen", (grupa, korisnik) => {
        console.log(`procitana posledna poraka vo grupa: ${grupa} od korisnik: ${korisnik}`);

        io.to(grupa).emit("seenPoraka", grupa, korisnik);
    })

    socket.on("izbrisanKorisnik", (korisnik, grupa) => {
        io.to(korisnik).emit("izbrisanKorisnikServer", (grupa));
    })

    socket.on("izbrisanKorisnikClient", (grupa) => {
        socket.leave(grupa);
    })
})
io.listen(8000);

//kreni server
server.listen(port, () => {
    console.log('Server running on port ' + port);
})