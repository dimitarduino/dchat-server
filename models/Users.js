const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    ime: {
        type: String,
        required: true
    },
    prezime: {
        type: String,
        required: true
    },
    telefon: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    lozinka: {
        type: String,
        required: true
    },
    aktiven: {
        type: Date
    }
})

module.exports = mongoose.model('user', UserSchema);