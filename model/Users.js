const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    first: {
        type: String,
        required: true
    },
    last: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    added: {
        type: Date,
        default: Date.now
    }
});

module.exports = User = mongoose.model('user',userSchema);