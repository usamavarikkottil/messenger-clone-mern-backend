//dependencies
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Pusher = require("pusher");
require("dotenv").config();
const Message = require("./models/messageModel.js");
//app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: '1085697',
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: 'ap2',
    useTLS: true
  });


//middlewares
app.use(express.json());
app.use(cors());


//db config
mongoose.connect(process.env.MONGO_DB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once("open", () => {
    console.log("MongoDB connection successfull...");
    const changeStream = mongoose.connection.collection("messages").watch();
    changeStream.on("change", (change) => {
        pusher.trigger('messages', 'newMessage', {
            'change': change
          });
    } )
});


//api routes
app.get("/", (req, res) => {
    res.send("Good Job");
});

app.get("/retrieve/conversation", (req, res) => {
    Message.find({})
        .then((data) => {
            data.sort((b, a) => {

                return b.timestamp - a.timestamp;
            })
            res.status(200).send(data);
        })
        .catch((err) => res.status(500).send(err));
})

app.post("/save/message", (req, res) => {
    const newMessage = req.body;
    Message.create(newMessage)
        .then((data) => {
            res.status(201).send(data);
        })
        .catch((err) => res.status(500).send(err));
})

//listeners
app.listen(port, () => console.log(`The server is listening on port ${port}`));