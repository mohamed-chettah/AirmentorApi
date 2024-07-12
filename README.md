# Air Mentor Api

## Description

This is the backend for the Air Mentor project. It is a RESTful API built with Node.js, Hono, and MongoDB.

## Setup and Installation

### Environemnt Variables

Create a `.env` file in the root of the project and add the following environment variables:

```sh
MONGODB_CLUSTER=mongodb_cluster
MONGODB_USER=mongodb_user
MONGODB_PWD=mongodb_pwd
MONGODB_DATABASE=mongodb_database
PORT=3001
BASE_ROUTE=/api
APP_URL=http://localhost:3000

JWT_SECRET=your_secret
OAUTH_GOOGLE_CLIENT_ID=https://accounts.google.com
OAUTH_CLIENT_SECRET=your_client_secret
OAUTH_REDIRECT_URI=https://example.com/callback

```
### Install Dependencies

```sh
npm install
```

### Development Server

```sh
npm run dev

# server will run on port 3001
```

## Api Endpoints

### Guard

A guard is a middleware that checks if a user is authenticated before allowing access to a route. It also checks the authorized roles such as `ADMIN` on all the `api/*` routes.

### Logic Routes

The logic routes have been all declared in the `localhost:3001/api/*` routes and have been secured with the guard

### Auth Routes

The auth routes have been all declared in the `localhost:3001/auth/*` routes and not been secured with the guard as they are the routes that will be used to authenticate the user.

