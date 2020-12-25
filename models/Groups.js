const mongoose = require('mongoose')

const GroupsSchema = new mongoose.Schema({
    korisnici: {
        type: [String],
        required: true
    },
    poslednaPoraka: {
        type: Number,
        required: false,
        default: 0
    },
    ime: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('group', GroupsSchema);