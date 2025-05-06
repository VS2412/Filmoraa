const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    releaseDate: {
        type: Date,
        required: true
    },
    poster: {
        type: String,
        required: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    theaters: [{
        name: String,
        location: String,
        showTimes: [{
            time: String,
            seats: [{
                seatNumber: String,
                isBooked: {
                    type: Boolean,
                    default: false
                },
                bookedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            }]
        }]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Movie', movieSchema); 