# Nexora Backend

Backend service for **Nexora**, a location-based social connection platform that helps users discover and connect with people nearby.

## Current Status

🚧 Under Development

The backend foundation is currently being built using production-oriented practices including modular architecture, environment configuration, database integration, logging, and scalable API design.

## Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose ODM

### Development Tools

* Git & GitHub
* Postman (API testing)
* Nodemon

## Project Structure

```
backend
│
├── src
│   ├── app.js
│   ├── server.js
│   ├── config
│   ├── models
│   ├── controllers
│   ├── routes
│   ├── services
│   ├── middleware
│   └── utils
│
├── .env.example
├── package.json
└── README.md
```

## Environment Variables

Create a `.env` file in the backend directory.

Example:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=
CLIENT_URL=
```

## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Navigate to backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

## Development Roadmap

* [x] Backend project initialization
* [ ] MongoDB database connection
* [ ] Logging system
* [ ] Global error handling
* [ ] User authentication
* [ ] User profile management
* [ ] Nearby user discovery
* [ ] Friend request system
* [ ] Real-time chat
* [ ] Notifications

## Architecture Goal

Nexora backend is being designed with a modular architecture to maintain scalability, maintainability, and clean separation of responsibilities.
