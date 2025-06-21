# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Alarm Clock application built with the NERD Stack (Node, Express, React, MongoDB) that allows users to sign up and save alarm times.

## Commands

### Development
- `npm start` - Builds the application and starts the server on port 3000
- `npm run build` - Builds the React frontend with webpack (creates bundle in /public)
- `docker compose up` - Run the full application with MongoDB using Docker
- `docker compose -f docker-compose-m1.yml up` - Run on M1 Macs

### Testing & Quality
- `npm test` - Runs Jest tests from test/server.spec.js
- `npm run lint` - Runs ESLint on src/**/*.js files

### Single Test Execution
- `jest test/server.spec.js --testNamePattern="test name"` - Run a specific test by name

## Architecture

### Backend Structure
- **server.js** - Entry point, starts Express server on PORT (default 3000)
- **app.js** - Express application setup with middleware, routes, and security headers
- **controllers.js** - MongoDB integration and all API endpoint handlers:
  - User authentication (signup/signin/signout)
  - Alarm time management (add/delete/update)
  - Session management using cookie-session
  - Direct MongoDB connection (no ORM)

### Frontend Structure
- **src/index.js** - React app entry point
- **src/components/** - React components organized by feature:
  - `app/` - Main application component with Web Worker for alarm monitoring
  - `clock/` - Clock display component
  - `alarmModal/` - Alarm notification modal
  - `timeForm/` & `timeTable/` - Time management UI
  - `login/`, `register/`, `logout/` - Authentication components
  - `titlebar/` - Application header

### Key Technical Details
- **Web Workers**: Used for background alarm monitoring (src/assets/loop.js)
- **Notifications API**: Browser notifications for alarms
- **Authentication**: bcrypt for password hashing, cookie-session for sessions
- **Build**: Webpack 2 with Babel for ES6/React transpilation, Stylus for CSS
- **API**: RESTful endpoints under /api/* with CORS enabled
- **Environment Variables**:
  - `PORT` - Server port (default 3000)
  - `API_URL` - Frontend API URL (injected via webpack)
  - `MONGODB_URI` - MongoDB connection string
  - `SECRET` - Session secret key

### Data Flow
1. React frontend makes axios requests to Express API endpoints
2. Controllers handle auth via sessions and interact with MongoDB
3. Web Worker runs in background checking stored alarm times against current time
4. When alarm triggers, Notification API alerts user and AlarmModal displays

### MongoDB Schema
Users collection with structure:
```
{
  _id: ObjectId,
  email: string,
  username: string,
  password: string (bcrypt hashed),
  times: [{
    _id: ObjectId,
    hours: number,
    minutes: number,
    seconds: number,
    ampm: string,
    // day properties
  }]
}
```