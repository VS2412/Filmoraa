document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || user.role !== 'user') {
        window.location.href = '/index.html';
        return;
    }

    // Load bookings
    loadBookings();

    // Logout handler
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    });
});

async function loadBookings() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/bookings/my-bookings', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const bookings = await response.json();
        displayBookings(bookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
        document.getElementById('bookingsList').innerHTML = '<p>Error loading bookings</p>';
    }
}

function displayBookings(bookings) {
    if (bookings.length === 0) {
        document.getElementById('bookingsList').innerHTML = '<p>No bookings found</p>';
        return;
    }

    const bookingsHtml = bookings.map(booking => `
        <div class="booking-item">
            <div class="movie-info">
                <h3>${booking.movie.title}</h3>
                <p><strong>Theater:</strong> ${booking.theater.name} - ${booking.theater.location}</p>
                <p><strong>Show Time:</strong> ${booking.showTime}</p>
                <p><strong>Seats:</strong> ${booking.seats.map(seat => seat.seatNumber).join(', ')}</p>
                <p><strong>Total Amount:</strong> $${booking.totalAmount}</p>
                <p><strong>Status:</strong> <span class="status ${booking.status}">${booking.status}</span></p>
                <p><strong>Booking Date:</strong> ${new Date(booking.bookingDate).toLocaleString()}</p>
            </div>
        </div>
    `).join('');

    document.getElementById('bookingsList').innerHTML = bookingsHtml;
} 