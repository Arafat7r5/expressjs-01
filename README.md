# ExpressJS-01: Social Media Backend API

## Project Overview

This is a backend API project built with Express.js in Node.js, implementing a simple social media-like application. It supports user authentication, post management, and voting on posts. The project uses PostgreSQL as the database and includes features for secure authentication via JWT tokens.

## Features

### User Management

- User registration (POST `/users`): Create a new user with email and password.
- User retrieval (GET `/users/{id}`): Fetch details of a specific user by ID.

### Authentication

- Login (POST `/login`): Authenticate with email and password to receive a JWT access token.
- JWT-based authorization middleware for protected endpoints.

### Post Management

- Create post (POST `/posts`): Add a new post with title, content, and published status (requires authentication; owner is set to the current user).
- Retrieve all posts (GET `/posts`): List posts with pagination (limit and skip), search by title, and include vote counts. Optionally filter to show only the current user's posts.
- Retrieve single post (GET `/posts/{id}`): Get details of a specific post including vote count.
- Update post (PUT `/posts/{id}`): Edit a post (only by the owner).
- Delete post (DELETE `/posts/{id}`): Remove a post (only by the owner).

### Voting System

- Vote on post (POST `/votes`): Upvote (dir=1) or remove vote/downvote (dir=0) on a post. Prevents duplicate votes and checks for post existence.

### Other

- Root endpoint (GET `/`): Returns a simple "Hello World" message.
- CORS support for specified origins (e.g., https://www.google.com).
- Ownership enforcement: Users can only modify or delete their own posts.
- Timestamps: Automatic created_at fields for users and posts (via database defaults).

## Libraries and Dependencies

The project dependencies are listed in `package.json`. Here's a breakdown with their purposes:

- **express**: The core web framework for handling routes, middleware, and HTTP requests/responses.
- **pg**: PostgreSQL client for Node.js, used to create a connection pool and execute raw SQL queries.
- **bcryptjs**: Password hashing library (bcrypt implementation) for securely storing and verifying user passwords.
- **jsonwebtoken**: Library for generating and verifying JWT (JSON Web Tokens) for authentication.
- **cors**: Middleware to enable Cross-Origin Resource Sharing, allowing requests from specified origins.
- **dotenv**: Loads environment variables from a `.env` file for configuration (e.g., database credentials, secret key).
- **nodemon** (dev dependency): Monitors file changes and auto-restarts the server during development.

## Important Aspects

### Database Setup

- Uses PostgreSQL database named `expressjs-01`.
- Tables (users, posts, votes) must be created manually via SQL scripts (no built-in migrations). Foreign keys and constraints are defined for integrity.

### Configuration

- Settings like database credentials, secret key for JWT, and token expiration are loaded from a `.env` file.

### Project Structure

- `config/`: Configuration files.
  - `db.js`: Database connection pool setup.
- `middleware/`: Custom middleware.
  - `auth.js`: JWT verification middleware.
- `routers/`: Modular routes for auth, posts, users, votes.
- `utils/`: Utility functions.
  - `hash.js`: Password hashing utilities.
- `app.js`: Entry point, app initialization, middleware setup, and route mounting.

### Security

- Passwords are hashed with bcrypt.
- JWT tokens expire (configurable).
- Ownership checks prevent unauthorized actions.
- SQL queries are parameterized to prevent injection.

### Development

- Run with `npm run dev` (uses nodemon) or `npm start`.
- Listens on port 8000 (configurable).

### Environment

- Requires Node.js and a running PostgreSQL server.
- Install dependencies with `npm install`.
