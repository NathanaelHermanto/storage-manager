const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    qty: {
        type: Number,
        required: true
    }
});

module.exports = itemSchema;