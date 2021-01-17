const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
    isprakjac: {
        type: String,
        required: true,
    },
    grupa: {
        type: String,
        required: true,
    },
    sodrzina: {
        type: String,
        required: true
    },
    procitanoOd: [String]
}, {
    timestamps: true
})

module.exports = mongoose.model('message', MessageSchema);