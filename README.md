# Project Name

User Authentication API

## Description

This project implements a User Authentication API using Node.js, Express.js, and SQLite. The API provides endpoints for user registration, login, and password change. User information is stored in a SQLite database, and passwords are hashed using bcrypt for security.

## Installation

1. Clone the repository: `[git clone https://github.com/username/repository.git](https://github.com/dev-ajithkumar/express-auth-api.git)`
2. Navigate to the project directory: `cd repository`
3. Install the dependencies: `npm install`

## Database Setup

1. Open the `userData.db` file using an SQLite database management tool.
2. Run the following SQL query to create the `user` table:

```sql
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    gender TEXT NOT NULL,
    location TEXT NOT NULL
);
```

## Usage

1. Start the server: `npm start`
2. Use an API testing tool (e.g., Postman) to send requests to the following endpoints:

### GET /register

- Description: Fetches all users from the database.
- Response: Array of user objects.

### POST /register

- Description: Registers a new user.
- Request Body: JSON object with the following properties:
  - `username`: User's username (string, required).
  - `name`: User's name (string, required).
  - `password`: User's password (string, required).
  - `gender`: User's gender (string, required).
  - `location`: User's location (string, required).
- Response:
  - Success: "User created successfully".
  - Error (User already exists): "User already exists".
  - Error (Password too short): "Password is too short".

### POST /login

- Description: Authenticates a user.
- Request Body: JSON object with the following properties:
  - `username`: User's username (string, required).
  - `password`: User's password (string, required).
- Response:
  - Success: "Login success!".
  - Error (Invalid user): "Invalid user".
  - Error (Invalid password): "Invalid password".

### PUT /change-password

- Description: Changes the password for a user.
- Request Body: JSON object with the following properties:
  - `username`: User's username (string, required).
  - `oldPassword`: User's current password (string, required).
  - `newPassword`: User's new password (string, required).
- Response:
  - Success: "Password updated".
  - Error (Invalid current password): "Invalid current password".
  - Error (New password too short): "Password is too short".

## Dependencies

- express: Web framework for Node.js
- sqlite: SQLite database driver for Node.js
- sqlite3: SQLite library for Node.js
- bcrypt: Library for password hashing
- path: Module for file path manipulation

## GitHub Pages Deployment (`gh-pages`)

This application is fully configured for deployment on **GitHub Pages**:

### Option 1: Automatic Deployment via GitHub Actions (Recommended)
1. Push this repository to GitHub on `main` or `master`.
2. Go to your GitHub repository **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` will automatically build the static assets with relative paths (`./`) and deploy the app to `https://<username>.github.io/<repository-name>/`.

### Option 2: Deploying via `gh-pages` Branch
1. Run the deploy script locally:
   ```bash
   npm run deploy
   ```
2. In your repository **Settings** > **Pages**, set **Source** to `Deploy from a branch` and choose the `gh-pages` branch.

### Key Features Configured for GitHub Pages:
- **Relative Asset Paths (`base: './'`)**: Assets load properly under any repository subfolder or custom domain.
- **SPA Fallback (`public/404.html`)**: Prevents 404 errors when reloading routes directly.
- **`.nojekyll`**: Prevents Jekyll from omitting required build files.
- **Offline & Static Fallback Mode**: Client authentication, requests management, institutional trading dashboard, and performance analytics function seamlessly in static preview even without a Node.js server.

