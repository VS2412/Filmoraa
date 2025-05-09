document.addEventListener('DOMContentLoaded', () => {
    // Modal elements
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const closeButtons = document.querySelectorAll('.close');
    const searchInput = document.getElementById('movieSearch');
    const searchBtn = document.getElementById('searchBtn');

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

    // Initialize banner and load movies
    initializeBanner();
    loadMovies();

    // Search functionality
    if (searchInput && searchBtn) {
        const performSearch = async () => {
            const searchTerm = searchInput.value.trim();
            
            try {
                let response;
                if (!searchTerm) {
                    // If search is empty, fetch all movies
                    response = await fetch('/api/movies');
                } else {
                    // If search has text, use search endpoint
                    response = await fetch(`/api/movies/search?q=${encodeURIComponent(searchTerm)}`);
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch movies');
                }

                const movies = await response.json();
                console.log('Search results:', movies.length); // Debug log
                displayMovies(movies);
            } catch (error) {
                console.error('Error:', error);
                const movieGrid = document.getElementById('allMovies');
                if (movieGrid) {
                    movieGrid.innerHTML = '<div class="error-message">Failed to load movies. Please try again.</div>';
                }
            }
        };

        // Search on button click
        searchBtn.addEventListener('click', performSearch);

        // Search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // Search on input (with debounce)
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(performSearch, 500);
        });
    }
});

// Banner Auto-scrolling
function initializeBanner() {
    let currentSlide = 0;
    const bannerSlides = document.querySelectorAll('.banner-slide');
    const bannerInterval = 2000; // Change slide every 2 seconds

    function showSlide(index) {
        bannerSlides.forEach(slide => slide.classList.remove('active'));
        bannerSlides[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % bannerSlides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + bannerSlides.length) % bannerSlides.length;
        showSlide(currentSlide);
    }

    // Auto-scroll banner
    let bannerTimer = setInterval(nextSlide, bannerInterval);

    // Pause auto-scroll on hover
    const bannerSlider = document.querySelector('.banner-slider');
    if (bannerSlider) {
        bannerSlider.addEventListener('mouseenter', () => {
            clearInterval(bannerTimer);
        });

        bannerSlider.addEventListener('mouseleave', () => {
            bannerTimer = setInterval(nextSlide, bannerInterval);
        });
    }

    // Manual navigation
    const prevBtn = document.querySelector('.banner-prev');
    const nextBtn = document.querySelector('.banner-next');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            clearInterval(bannerTimer);
            prevSlide();
            bannerTimer = setInterval(nextSlide, bannerInterval);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            clearInterval(bannerTimer);
            nextSlide();
            bannerTimer = setInterval(nextSlide, bannerInterval);
        });
    }
}

// Load and display movies
async function loadMovies() {
    try {
        const response = await fetch('/api/movies');
        if (!response.ok) {
            throw new Error('Failed to load movies');
        }
        const movies = await response.json();
        displayMovies(movies);
    } catch (error) {
        console.error('Error loading movies:', error);
        const movieGrid = document.getElementById('allMovies');
        if (movieGrid) {
            movieGrid.innerHTML = '<div class="error-message">Failed to load movies. Please try again later.</div>';
        }
    }
}

function displayMovies(movies) {
    const movieGrid = document.getElementById('allMovies');
    if (!movieGrid) return;

    if (!movies || movies.length === 0) {
        movieGrid.innerHTML = '<div class="no-results">No movies found</div>';
        return;
    }

    movieGrid.innerHTML = '';

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>${movie.genre}</p>
                <p>Duration: ${movie.duration} min</p>
                <button class="btn btn-primary" onclick="bookTicket('${movie._id}')">Book Now</button>
            </div>
        `;
        movieGrid.appendChild(movieCard);
    });
}

// Book ticket function
function bookTicket(movieId) {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementById('loginBtn').click();
        return;
    }
    // Redirect to booking page
    window.location.href = `/booking.html?movie=${movieId}`;
} 