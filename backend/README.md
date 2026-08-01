# Nexora Backend

Backend service for **Nexora**, a location-based social connection platform that helps users discover, connect, and interact with people nearby.

---

## Current Status

🚧 **Active Development**

The backend currently includes a production-oriented authentication system with secure JWT-based authentication, refresh token rotation, password hashing, centralized error handling, request validation, structured logging, and a modular architecture.

Additional social networking features are under active development.

---

## Tech Stack

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose ODM

### Authentication

- JSON Web Token (JWT)
- bcrypt
- Cookie-based Authentication

### Validation

- Zod

### Logging

- Winston

### Development Tools

- Git & GitHub
- Postman
- Nodemon

---

## Project Structure

```text
backend
│
├── src
│   ├── app.js
│   ├── server.js
│   │
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── validations
│   ├── utils
│   └── logger
│
├── docs
│   ├── authentication
│   └── database
│
├── logs
│
├── .env.example
├── package.json
└── README.md
```

---

## Implemented Features

- User Registration
- User Login
- JWT Authentication
- Access & Refresh Token Generation
- Refresh Token Rotation
- Secure Logout
- Password Hashing with bcrypt
- Cookie-based Authentication
- Request Validation
- Centralized Error Handling
- Structured Logging with Winston
- Environment-based Configuration
- Modular Architecture
- Authentication Documentation

---

## Authentication APIs

| Method | Endpoint |
|---------|----------|
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |
| POST | `/api/auth/refresh-token` |
| POST | `/api/auth/logout` |

---

## Environment Variables

Create a `.env` file in the project root.

Example:

```env
PORT=5000

NODE_ENV=development

MONGODB_URI=

JWT_ACCESS_SECRET=
JWT_ACCESS_TOKEN_EXPIRY=1d

JWT_REFRESH_SECRET=
JWT_REFRESH_TOKEN_EXPIRY=7d

BCRYPT_SALT_ROUNDS=10

CLIENT_URL=http://localhost:5173
```

---

## Installation

Clone the repository to your local machine.

```bash
git clone https://github.com/Komala-L/nexora
```

Navigate into the backend directory.

```bash
cd backend
```

Install dependencies.

```bash
npm install
```

Start the development server.

```bash
npm run dev
```

---

## Documentation

Project documentation is available inside the `docs/` directory.

### Authentication

- Authentication Overview
- JWT Authentication
- Password Hashing
- Refresh Token Architecture
- Authentication Security Best Practices

### Database

- User Model Design

---

## Development Roadmap

### Completed

- [x] Backend project initialization
- [x] MongoDB integration
- [x] Environment configuration
- [x] Logging system
- [x] Global error handling
- [x] Request validation
- [x] User authentication
- [x] JWT authentication
- [x] Refresh token implementation
- [x] Logout functionality
- [x] Authentication documentation

### In Progress

- [ ] User profile management
- [ ] Nearby user discovery
- [ ] Friend request system
- [ ] Real-time chat
- [ ] Notifications

---

## Architecture

Nexora follows a modular, production-oriented architecture that separates controllers, services, models, middleware, utilities, validations, configuration, and documentation into independent layers.

The project emphasizes:

- Scalability
- Maintainability
- Security
- Separation of Concerns
- Clean Architecture Principles

---

## License

No license has been applied yet. This repository is currently intended for educational and portfolio purposes.