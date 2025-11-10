# BoneAPI

Backend showcase for the FetchUI (https://github.com/hectormiranda8/FetchUI) frontend repository.

## Overview

BoneAPI is a comprehensive RESTful backend application built with Express.js that provides a complete photo-sharing platform with advanced social features. Originally designed as a backend showcase for the FetchUI frontend, this API demonstrates modern backend development practices including JWT-based authentication, role-based access control, content moderation, and professional image processing.

The API enables users to:
- Register and authenticate with secure password hashing and JWT tokens
- Upload and manage personal photo collections with file or URL uploads
- Browse and discover photos through categories and tags
- Interact with photos through likes and comments
- Customize profiles with avatars, display names, and bios
- Submit photos for public approval through a moderation workflow

The platform provides administrators with:
- Content moderation dashboard for reviewing photo submissions
- User role management and admin privilege assignment
- Comment moderation and content removal capabilities
- Platform statistics and analytics

## Tech Stack

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, minimalist web framework for building RESTful APIs
- **LowDB** - Lightweight JSON database for simple data persistence

### Authentication & Security
- **bcrypt** - Secure password hashing
- **jsonwebtoken (JWT)** - Token-based authentication
- **CORS** - Cross-Origin Resource Sharing middleware

### File Processing & Storage
- **multer** (v2.0.0-rc.4) - Multipart form data and file upload handling
- **sharp** (v0.33.1) - High-performance image processing, resizing, and format conversion

### Development Tools
- **nodemon** - Automatic server restart during development
- **dotenv** - Environment variable management

### Key Capabilities Showcased
- **RESTful API Design** - Clean, resource-based endpoints following REST principles
- **JWT Authentication** - Stateless authentication with token generation and verification
- **Role-Based Access Control (RBAC)** - Admin middleware for privileged operations
- **Content Moderation** - Photo approval workflow with admin review system
- **File Upload & Processing** - Professional image handling with automatic optimization
- **Image Optimization** - Automatic WebP conversion, resizing, and quality control
- **Social Features** - Comments, likes, user profiles, and content discovery
- **Middleware Architecture** - Custom middleware for authentication, validation, error handling, and admin checks
- **Input Validation** - Comprehensive request validation for data integrity and security
- **Error Handling** - Centralized error handling with meaningful HTTP status codes
- **Authorization** - Resource ownership verification and permission checks
- **Database Operations** - Complex CRUD operations with data filtering, user isolation, and relational queries
- **Tagging System** - User-generated tags with normalization and popularity tracking
- **Categorization** - Predefined photo categories for organized browsing
- **Security Best Practices** - Password hashing, secure token management, protected routes, file type validation

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

The `/public/uploads` directory will be automatically created for storing uploaded files.

## API Endpoints

### Health Check
- `GET /health` - Verify API is running

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email/username and receive JWT token
- `POST /api/auth/logout` - Logout (invalidate token)
- `GET /api/auth/me` - Get current user info (protected)
- `PUT /api/auth/profile` - Update profile (display name, bio) (protected)
- `POST /api/auth/avatar` - Upload profile avatar (protected)
- `GET /api/auth/profile/:userId` - View public user profile

### Photos (`/api/photos`)
- `GET /api/photos` - Get all approved public photos with user info, like counts, and comment counts
- `GET /api/photos/:id` - Get single photo with full details
- `GET /api/photos/my-photos` - Get current user's uploaded photos (protected)
- `GET /api/photos/my-uploads` - Get current user's photo uploads with stats (protected)
- `GET /api/photos/liked` - Get photos liked by current user (protected)
- `POST /api/photos/upload` - Upload photo (file or URL) with title, description, category, and tags (protected)
- `PATCH /api/photos/:id` - Update photo metadata (title, description, category, tags) (protected)
- `PATCH /api/photos/:id/visibility` - Toggle photo visibility or submit for approval (protected)
- `POST /api/photos/:id/like` - Like a photo (protected)
- `DELETE /api/photos/:id/like` - Unlike a photo (protected)
- `DELETE /api/photos/:id` - Delete own photo (protected)
- `GET /api/photos/category/:category` - Browse photos by category
- `GET /api/photos/tag/:tag` - Browse photos by tag
- `GET /api/photos/tags` - Get all tags with usage counts
- `GET /api/photos/tags/popular` - Get top 20 trending tags

#### Photo Categories
- `puppies` - General puppy photos
- `portraits` - Close-up portraits
- `action` - Action and movement shots
- `sleeping` - Sleeping or resting
- `playing` - Playing and activities
- `nature` - Outdoor and nature settings
- `group` - Multiple dogs
- `other` - Uncategorized

### Comments (`/api/comments`)
- `GET /api/comments/:photoId` - Get all comments for a photo (public)
- `POST /api/comments/:photoId` - Add a comment to a photo (protected, max 500 chars)
- `PUT /api/comments/:commentId` - Edit own comment (protected)
- `DELETE /api/comments/:commentId` - Delete own comment (protected)

### Admin (`/api/admin`)
All admin endpoints require authentication and admin privileges.

- `GET /api/admin/pending-photos` - Review pending photo submissions
- `PATCH /api/admin/photos/:id/approve` - Approve photo for public display
- `PATCH /api/admin/photos/:id/reject` - Reject photo with optional reason
- `DELETE /api/admin/photos/:id` - Delete any photo (admin override)
- `DELETE /api/admin/comments/:id` - Delete any comment (moderation)
- `GET /api/admin/users` - List all users (without passwords)
- `PATCH /api/admin/users/:id/role` - Grant or revoke admin privileges
- `GET /api/admin/stats` - Platform statistics (users, photos, comments counts)

## Features

### Photo Approval Workflow
Photos have three visibility states:
- **private** - Only visible to the owner
- **pending** - Submitted for admin review
- **approved** - Publicly visible to all users

Users can submit photos for approval, and admins can approve or reject submissions with reasons.

### Image Upload & Processing
- Supports both file uploads and URL-based photo additions
- Automatic image optimization with Sharp (WebP conversion, resizing to 1200px)
- Avatar uploads with automatic 300x300 cropping
- File type validation (JPEG, PNG, GIF, WebP)
- 5MB file size limit
- Automatic cleanup of old files on deletion or avatar updates

### Social Features
- **Likes** - Users can like/unlike photos with persistent storage
- **Comments** - Full CRUD operations with 500 character limit
- **User Profiles** - Display names, bios, and avatars
- **Content Discovery** - Browse by categories and tags

### Tagging System
- User-generated tags with automatic normalization (lowercase, hyphenated)
- Up to 10 tags per photo
- Tag popularity tracking and trending tags API
- Browse photos by specific tags

### Database

The application uses LowDB with JSON file storage. Database files are automatically created on first run:
- `db.json` - Main database with users and photos
- `comments.json` - All photo comments
- `tags.json` - Tag usage tracking

Seed data includes:
- 50 default puppy photos with categories and tags
- Sample user data with admin account

### Project Structure

```
BoneAPI/
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   ├── admin.js             # Admin role verification
│   ├── errorHandler.js      # Global error handling
│   ├── validation.js        # Input validation
│   └── upload.js            # File upload configuration (multer)
├── routes/
│   ├── auth.js              # Authentication & user profile routes
│   ├── photos.js            # Photo management routes
│   ├── comments.js          # Comment CRUD routes
│   └── admin.js             # Admin/moderation routes
├── utils/
│   ├── db.js                # Database operations (LowDB)
│   ├── jwt.js               # JWT token utilities
│   ├── initDb.js            # Database initialization
│   └── imageOptimizer.js    # Image processing utilities (Sharp)
├── seed/
│   └── defaultPhotos.js     # Seed data for initial photos
├── public/
│   └── uploads/             # Uploaded files storage (avatars, photos)
├── index.js                 # Application entry point
├── package.json             # Project dependencies and scripts
└── .env.example             # Environment variables template
```

## Data Models

### User
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "password": "hashed_string",
  "displayName": "string (optional)",
  "bio": "string (optional)",
  "avatarUrl": "string (optional)",
  "isAdmin": "boolean",
  "createdAt": "ISO date string"
}
```

### Photo
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "imageUrl": "string",
  "userId": "uuid",
  "isDefault": "boolean",
  "status": "private | pending | approved",
  "category": "string",
  "tags": ["string"],
  "reviewedBy": "uuid (optional)",
  "reviewedAt": "ISO date string (optional)",
  "rejectionReason": "string (optional)",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

### Comment
```json
{
  "id": "uuid",
  "photoId": "uuid",
  "userId": "uuid",
  "content": "string (max 500 chars)",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

## Security Considerations

- Passwords are hashed with bcrypt before storage
- JWT tokens are used for stateless authentication
- File type validation prevents malicious uploads
- File size limits prevent DoS attacks (5MB max)
- Admin middleware protects privileged operations
- Resource ownership validation prevents unauthorized access
- CORS configured for cross-origin requests

## License

This project is open source and available for educational and demonstration purposes.
