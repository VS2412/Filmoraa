const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    theater: {
        name: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        }
    },
    showTime: {
        type: String,
        required: true
    },
    seats: [{
        seatNumber: String,
        price: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    }
});

module.exports = mongoose.model('Booking', bookingSchema); 