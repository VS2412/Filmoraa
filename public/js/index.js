document.addEventListener('DOMContentLoaded', () => {
    // Modal elements
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const closeButtons = document.querySelectorAll('.close');

    // Show login modal
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    // Show register modal
    registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'block';
    });

    // Switch to register modal
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
    });

    // Switch to login modal
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
    });

    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });

    // Load movies
    loadMovies();
});

async function loadMovies() {
    try {
        const response = await fetch('/api/movies');
        const movies = await response.json();

        // Separate movies into recommended and upcoming
        const now = new Date();
        const recommendedMovies = movies.filter(movie => new Date(movie.releaseDate) <= now);
        const upcomingMovies = movies.filter(movie => new Date(movie.releaseDate) > now);

        // Display recommended movies
        displayMovies(recommendedMovies, 'recommendedMovies');

        // Display upcoming movies
        displayMovies(upcomingMovies, 'upcomingMovies');
    } catch (error) {
        console.error('Error loading movies:', error);
    }
}

function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    if (movies.length === 0) {
        container.innerHTML = '<p>No movies available</p>';
        return;
    }

    const moviesHtml = movies.map(movie => `
        <div class="movie-card">
            <img src="${movie.poster}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>${movie.genre}</p>
                <p>${movie.duration} min</p>
            </div>
        </div>
    `).join('');

    container.innerHTML = moviesHtml;
} 