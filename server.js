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
        console.log("ova e grupaID:");
        console.log(grupaId);
        console.log("\n \n");

        console.log("ova e korisnici:");
        console.log(korisnici);
        console.log("\n \n");

        if (Array.isArray(grupaId)) {
            grupaId.push(korisnici);
            socket.join(grupaId);
            socket.to(grupaId).broadcast.emit('userConnected', korisnici);
        } else {
            let grupi = [grupaId, korisnici];
            socket.join(grupi);
            socket.to(grupi).broadcast.emit('userConnected', korisnici);
        }
    })
    socket.on("novaPoraka", (msgContent) => {
        const { poraka, grupa, isprakjac, korisniciPoraka, novaGrupa } = msgContent;

        console.log('nova poraka');
        console.log(korisniciPoraka);
        console.log(grupa);
        console.log(novaGrupa);
        console.log('nova poraka');
  
        if (novaGrupa) {    
            korisniciPoraka.forEach(korisnik => {
                io.to(korisnik).emit('nacrtajPoraka', poraka, grupa, isprakjac);
            })
        } else {
            io.to(grupa).emit('nacrtajPoraka', poraka, grupa, isprakjac);
        }
    })

    //seen 
    socket.on("seen", (grupa, korisnik) => {
        io.to(grupa).emit("seenPoraka", grupa, korisnik);
    })

    socket.on("izbrisanKorisnik", (korisnik, grupa) => {
        console.log('stigna izbrisanKorisnik');
        io.to(korisnik).emit("izbrisanKorisnikServer", grupa);
    })

    socket.on('izbrisanKorisnikClient', (grupa) => {
        console.log('stigna izbrisanKorisnikClient');
        console.log(socket);
        console.log(grupa);
        socket.leave(grupa);
    })
})
io.listen(8000);

//kreni server
server.listen(port, () => {
    console.log('Server running on port ' + port);
})
