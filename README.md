# BoneAPI

Backend showcase for the FetchUI (https://github.com/hectormiranda8/FetchUI) frontend repository.

## Overview

BoneAPI is a RESTful backend application built with Express.js that provides a complete authentication system and photo management platform. Originally designed as a backend showcase for the FetchUI frontend, this API demonstrates modern backend development practices including JWT-based authentication, middleware patterns, and JSON file-based data persistence.

The API enables users to:
- Register and authenticate with secure password hashing
- Manage personal photo collections
- Access a curated set of default puppy photos
- Perform CRUD operations on photo resources with proper authorization

## Tech Stack

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, minimalist web framework for building RESTful APIs
- **LowDB** - Lightweight JSON database for simple data persistence

### Authentication & Security
- **bcrypt** - Secure password hashing
- **jsonwebtoken (JWT)** - Token-based authentication
- **CORS** - Cross-Origin Resource Sharing middleware

### Development Tools
- **nodemon** - Automatic server restart during development
- **dotenv** - Environment variable management

### Key Capabilities Showcased
- **RESTful API Design** - Clean, resource-based endpoints following REST principles
- **JWT Authentication** - Stateless authentication with token generation and verification
- **Middleware Architecture** - Custom middleware for authentication, validation, and error handling
- **Input Validation** - Comprehensive request validation for data integrity
- **Error Handling** - Centralized error handling with meaningful HTTP status codes
- **Authorization** - Resource ownership verification and role-based access control
- **Database Operations** - CRUD operations with data filtering and user isolation
- **Security Best Practices** - Password hashing, secure token management, protected routes

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hectormiranda8/BoneAPI.git
cd BoneAPI
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Configure your `.env` file with the following variables:
```env
PORT=3000
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

**Important:** Generate a strong, random JWT secret for production use.

### Running the Application

#### Development Mode (with auto-reload):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

### API Endpoints

#### Health Check
- `GET /health` - Verify API is running

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `POST /api/auth/logout` - Logout (invalidate token)
- `GET /api/auth/me` - Get current user info (protected)

#### Photos
- `GET /api/photos` - Get all default photos (public)
- `GET /api/photos/my-photos` - Get user's personal photos (protected)
- `POST /api/photos/upload` - Upload a new photo (protected)
- `DELETE /api/photos/:id` - Delete user's photo (protected)

### Database

The application uses LowDB with JSON file storage. The database file (`db.json`) is automatically created on first run with seed data including:
- Default puppy photo collection
- Sample user data

### Project Structure

```
BoneAPI/
├── middleware/         # Custom middleware (auth, validation, error handling)
├── routes/            # API route definitions
├── utils/             # Utility functions (database, JWT, initialization)
├── seed/              # Seed data for database initialization
├── index.js           # Application entry point
├── package.json       # Project dependencies and scripts
└── .env.example       # Environment variables template
```

## License

This project is open source and available for educational and demonstration purposes.
