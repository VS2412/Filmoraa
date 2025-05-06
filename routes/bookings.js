const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');

// Create booking
router.post('/', auth, [
    body('movieId').notEmpty().withMessage('Movie ID is required'),
    body('theater').notEmpty().withMessage('Theater is required'),
    body('showTime').notEmpty().withMessage('Show time is required'),
    body('seats').isArray().withMessage('Seats must be an array')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { movieId, theater, showTime, seats } = req.body;

        // Check if seats are available
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        const theaterData = movie.theaters.find(t => t.name === theater.name && t.location === theater.location);
        if (!theaterData) {
            return res.status(404).json({ message: 'Theater not found' });
        }

        const showTimeData = theaterData.showTimes.find(st => st.time === showTime);
        if (!showTimeData) {
            return res.status(404).json({ message: 'Show time not found' });
        }

        // Check if seats are available
        for (const seat of seats) {
            const seatData = showTimeData.seats.find(s => s.seatNumber === seat.seatNumber);
            if (!seatData || seatData.isBooked) {
                return res.status(400).json({ message: `Seat ${seat.seatNumber} is not available` });
            }
        }

        // Create booking
        const booking = new Booking({
            user: req.user.userId,
            movie: movieId,
            theater,
            showTime,
            seats,
            totalAmount: seats.reduce((sum, seat) => sum + seat.price, 0)
        });

        await booking.save();

        // Update seat status
        for (const seat of seats) {
            const seatData = showTimeData.seats.find(s => s.seatNumber === seat.seatNumber);
            seatData.isBooked = true;
            seatData.bookedBy = req.user.userId;
        }

        await movie.save();

        res.status(201).json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.userId })
            .populate('movie')
            .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get admin's bookings
router.get('/admin', adminAuth, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate({
                path: 'movie',
                match: { admin: req.user.userId }
            })
            .populate('user', 'name email')
            .sort({ bookingDate: -1 });

        // Filter out bookings for movies not owned by this admin
        const filteredBookings = bookings.filter(booking => booking.movie !== null);
        
        res.json(filteredBookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update booking status (admin only)
router.patch('/:id/status', adminAuth, [
    body('status').isIn(['pending', 'confirmed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const booking = await Booking.findById(req.params.id)
            .populate({
                path: 'movie',
                match: { admin: req.user.userId }
            });

        if (!booking || !booking.movie) {
            return res.status(404).json({ message: 'Booking not found or unauthorized' });
        }

        booking.status = req.body.status;
        await booking.save();

        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 