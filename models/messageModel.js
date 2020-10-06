const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
    username: String,
    message: String,
    timestamp: String
})

module.exports = mongoose.model("message", messageSchema);