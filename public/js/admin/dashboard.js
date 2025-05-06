document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || user.role !== 'admin') {
        window.location.href = '/index.html';
        return;
    }

    // Load dashboard data
    loadDashboardData();

    // Logout handler
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    });
});

async function loadDashboardData() {
    try {
        const token = localStorage.getItem('token');
        
        // Fetch admin's movies
        const moviesResponse = await fetch('/api/movies/admin', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const movies = await moviesResponse.json();
        document.getElementById('totalMovies').textContent = movies.length;

        // Fetch admin's bookings
        const bookingsResponse = await fetch('/api/bookings/admin', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const bookings = await bookingsResponse.json();
        
        // Update bookings count
        document.getElementById('totalBookings').textContent = bookings.length;

        // Calculate total revenue
        const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;

        // Display recent bookings
        const recentBookings = bookings.slice(0, 5);
        const bookingsHtml = recentBookings.map(booking => `
            <div class="booking-item">
                <p><strong>Movie:</strong> ${booking.movie.title}</p>
                <p><strong>User:</strong> ${booking.user.name}</p>
                <p><strong>Amount:</strong> $${booking.totalAmount}</p>
                <p><strong>Status:</strong> ${booking.status}</p>
            </div>
        `).join('');

        document.getElementById('recentBookings').innerHTML = bookingsHtml || '<p>No recent bookings</p>';
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Error loading dashboard data');
    }
} 