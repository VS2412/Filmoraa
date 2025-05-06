document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || user.role !== 'admin') {
        window.location.href = '/index.html';
        return;
    }

    // Load movies
    loadMovies();

    // Add theater button handler
    document.getElementById('addTheater').addEventListener('click', addTheater);

    // Add movie form submission
    document.getElementById('addMovieForm').addEventListener('submit', handleAddMovie);

    // Logout handler
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    });
});

function addTheater() {
    const theatersDiv = document.getElementById('theaters');
    const theaterDiv = document.createElement('div');
    theaterDiv.className = 'theater';
    theaterDiv.innerHTML = `
        <input type="text" placeholder="Theater Name" class="theater-name" required>
        <input type="text" placeholder="Location" class="theater-location" required>
        <div class="show-times">
            <input type="time" class="show-time" required>
        </div>
        <button type="button" class="btn add-show-time">Add Show Time</button>
        <button type="button" class="btn remove-theater">Remove Theater</button>
    `;

    theaterDiv.querySelector('.add-show-time').addEventListener('click', () => {
        const showTimesDiv = theaterDiv.querySelector('.show-times');
        const timeInput = document.createElement('input');
        timeInput.type = 'time';
        timeInput.className = 'show-time';
        timeInput.required = true;
        showTimesDiv.appendChild(timeInput);
    });

    theaterDiv.querySelector('.remove-theater').addEventListener('click', () => {
        theaterDiv.remove();
    });

    theatersDiv.appendChild(theaterDiv);
}

async function handleAddMovie(e) {
    e.preventDefault();

    const theaters = Array.from(document.querySelectorAll('.theater')).map(theater => {
        const name = theater.querySelector('.theater-name').value;
        const location = theater.querySelector('.theater-location').value;
        const showTimes = Array.from(theater.querySelectorAll('.show-time')).map(input => ({
            time: input.value,
            seats: Array.from({ length: 50 }, (_, i) => ({
                seatNumber: `A${i + 1}`,
                isBooked: false
            }))
        }));

        return { name, location, showTimes };
    });

    const movieData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        genre: document.getElementById('genre').value,
        duration: parseInt(document.getElementById('duration').value),
        releaseDate: document.getElementById('releaseDate').value,
        poster: document.getElementById('poster').value,
        theaters
    };

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/movies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(movieData)
        });

        if (response.ok) {
            alert('Movie added successfully');
            e.target.reset();
            document.getElementById('theaters').innerHTML = '';
            addTheater();
            loadMovies();
        } else {
            const data = await response.json();
            alert(data.message || 'Error adding movie');
        }
    } catch (error) {
        console.error('Error adding movie:', error);
        alert('Error adding movie');
    }
}

async function loadMovies() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/movies/admin', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const movies = await response.json();
        const moviesHtml = movies.map(movie => `
            <div class="movie-item">
                <img src="${movie.poster}" alt="${movie.title}" class="movie-poster-small">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <p>${movie.description}</p>
                    <p><strong>Genre:</strong> ${movie.genre}</p>
                    <p><strong>Duration:</strong> ${movie.duration} minutes</p>
                    <p><strong>Release Date:</strong> ${new Date(movie.releaseDate).toLocaleDateString()}</p>
                    <button class="btn" onclick="deleteMovie('${movie._id}')">Delete</button>
                </div>
            </div>
        `).join('');

        document.getElementById('moviesList').innerHTML = moviesHtml || '<p>No movies found</p>';
    } catch (error) {
        console.error('Error loading movies:', error);
        document.getElementById('moviesList').innerHTML = '<p>Error loading movies</p>';
    }
}

async function deleteMovie(movieId) {
    if (!confirm('Are you sure you want to delete this movie?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/movies/${movieId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('Movie deleted successfully');
            loadMovies();
        } else {
            const data = await response.json();
            alert(data.message || 'Error deleting movie');
        }
    } catch (error) {
        console.error('Error deleting movie:', error);
        alert('Error deleting movie');
    }
} 