# Movie Ticket Booking System

A full-stack web application for booking movie tickets with separate admin and user panels.

## Features

### Admin Panel
- Dashboard with overview of movies, bookings, and revenue
- Add, edit, and delete movies
- Manage movie theaters and show times
- View and manage all bookings
- Update booking status

### User Panel
- Browse movies with filters (search, genre, location)
- View movie details and available show times
- Select seats and book tickets
- View booking history
- Track booking status

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- Authentication: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm (Node Package Manager)

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd movie-ticket-booking
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your MongoDB Atlas URI:
```
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
```

4. Start the server:
```bash
npm start
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### Admin Access
1. Register as an admin user
2. Login with admin credentials
3. Access the admin dashboard to manage movies and bookings

### User Access
1. Register as a regular user
2. Login with user credentials
3. Browse movies and book tickets

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Movies
- GET /api/movies - Get all movies
- GET /api/movies/:id - Get movie by ID
- POST /api/movies - Add new movie (admin only)
- PUT /api/movies/:id - Update movie (admin only)
- DELETE /api/movies/:id - Delete movie (admin only)

### Bookings
- POST /api/bookings - Create new booking
- GET /api/bookings/my-bookings - Get user's bookings
- GET /api/bookings/all - Get all bookings (admin only)
- PATCH /api/bookings/:id/status - Update booking status (admin only)

## Security Features

- JWT-based authentication
- Password hashing using bcrypt
- Role-based access control
- Protected API endpoints

## Error Handling

The application includes comprehensive error handling for:
- Invalid input validation
- Authentication errors
- Database operation errors
- API request errors

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 