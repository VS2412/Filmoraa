const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const Movie = require('../models/Movie');

// Get all movies (for users)
router.get('/', async (req, res) => {
    try {
        const { genre, location, search } = req.query;
        let query = {};

        // Handle search
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Handle genre filter
        if (genre) {
            query.genre = { $regex: genre, $options: 'i' };
        }

        // Handle location filter
        if (location) {
            query['theaters.location'] = { $regex: location, $options: 'i' };
        }

        console.log('Main route query:', query); // Debug log
        const movies = await Movie.find(query);
        res.json(movies);
    } catch (error) {
        console.error('Error in GET /movies:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search movies (for both index and dashboard)
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        console.log('Search query:', q); // Debug log

        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const movies = await Movie.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ]
        });

        console.log('Search results:', movies.length); // Debug log
        res.json(movies);
    } catch (error) {
        console.error('Error in search:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get admin's movies
router.get('/admin', adminAuth, async (req, res) => {
    try {
        const movies = await Movie.find({ admin: req.user.userId });
        res.json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get movie by ID (must be after other GET routes)
router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        
        res.json(movie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new movie (admin only)
router.post('/', adminAuth, [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('genre').notEmpty().withMessage('Genre is required'),
    body('duration').isNumeric().withMessage('Duration must be a number'),
    body('releaseDate').isISO8601().withMessage('Invalid release date'),
    body('poster').notEmpty().withMessage('Poster URL is required'),
    body('theaters').isArray().withMessage('Theaters must be an array')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const movieData = {
            ...req.body,
            admin: req.user.userId
        };

        const movie = new Movie(movieData);
        await movie.save();
        res.status(201).json(movie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update movie (admin only)
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const movie = await Movie.findOne({ _id: req.params.id, admin: req.user.userId });
        
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found or unauthorized' });
        }

        Object.assign(movie, req.body);
        await movie.save();
        
        res.json(movie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete movie (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const movie = await Movie.findOneAndDelete({ _id: req.params.id, admin: req.user.userId });
        
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found or unauthorized' });
        }
        
        res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 