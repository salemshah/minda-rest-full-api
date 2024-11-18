# 🟢 Minda REST FULL API 

![License](https://img.shields.io/badge/license-Private-green.svg)
![Node.js](https://img.shields.io/badge/node.js-20.0.0-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.5.4-blue.svg)
![Express](https://img.shields.io/badge/Express-4.17.1-lightgrey.svg)
![Prisma](https://img.shields.io/badge/Prisma-5.20.0-brightgreen.svg)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
    - [Database Setup](#database-setup)
    - [Running the Project](#running-the-project)
- [Scripts](#scripts)

[//]: # (- [API Documentation]&#40;#api-documentation&#41;)
[//]: # (- [Testing]&#40;#testing&#41;)
[//]: # (- [Linting and Formatting]&#40;#linting-and-formatting&#41;)
[//]: # (- [Contributing]&#40;#contributing&#41;)
- [License](#license)
- [Author](#author)

## Overview

**Minda RESTful API** is a robust and scalable backend service built with Express.js and TypeScript, leveraging Prisma for database management. It provides a secure and efficient foundation for managing resources, implementing authentication, and handling various business logic required for modern web applications.

## Features

- **Authentication & Authorization:** Secure endpoints using JWT.
- **Database Management:** Utilize Prisma ORM for efficient database interactions.
- **Validation:** Ensure data integrity with Zod validation.
- **Logging:** Comprehensive logging with Winston and Morgan.
- **API Documentation:** Interactive API docs using Swagger.
- **Testing:** Reliable testing setup with Jest and Supertest.
- **Linting & Formatting:** Maintain code quality with ESLint and Prettier.
- **Git Hooks:** Automate tasks with Husky and lint-staged.
- **Performance Monitoring:** Monitor metrics with Prometheus (`prom-client`).
- **Error Handling:** Centralized error handling for improved reliability.
- **Security Enhancements:** Implement security best practices with Helmet and CORS.

## Technologies Used

- **Runtime & Language:** Node.js, TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Authentication:** JSON Web Tokens (JWT)
- **Validation:** Zod
- **Logging:** Winston, Morgan
- **Testing:** Jest, Supertest
- **Linting & Formatting:** ESLint, Prettier
- **API Documentation:** Swagger (`swagger-jsdoc`, `swagger-ui-express`)
- **Version Control:** Git, Husky
- **Other Tools:** Nodemailer, Helmet, CORS, Compression, UUID, Winston

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js:** v20.0.0 or higher
- **npm:** v9.0.0 or higher
- **TypeScript:** v4.5.4 or higher
- **Git:** For version control

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/salemshah/minda-rest-full-api.git
   cd minda-rest-full-api


## Main Endpoints

| Endpoint                      | Description                                                                 |
| ----------------------------- | --------------------------------------------------------------------------- |
| [`http://localhost:8000/api/`](http://localhost:8000/api/)           | **Main API Endpoint:** Serves as the primary access point for all API routes and functionalities. Handles requests related to your application's core features. |
| [`http://localhost:8000/metrics/`](http://localhost:8000/metrics/) | **Metrics Endpoint:** Exposes application performance and health metrics, typically used for monitoring and observability with tools like Prometheus. |
| [`http://localhost:8000/api-docs/`](http://localhost:8000/api-docs/) | **API Documentation:** Provides interactive Swagger UI documentation, allowing developers to explore and test API endpoints directly from the browser. |



## Scripts

| Command                   | Description                                  |
|---------------------------|----------------------------------------------|
| `npm run dev`             | Start the development server with nodemon    |
| `npm run build`           | Compile TypeScript to JavaScript             |
| `npm start`               | Start the production server                  |
| `npm run lint`            | Run ESLint in watch mode                     |
| `npm run lint:fix`        | Fix linting issues automatically             |
| `npm run format`          | Format the codebase using Prettier           |
| `npm run format:check`    | Check code formatting without making changes |
| `npm run test`            | Run tests with coverage                      |
| `npm run test:ci`         | Run tests in CI mode                         |
| `npm run prisma:generate` | Generate Prisma client                       |
| `npm run prisma:migrate`  | Apply database migrations                    |
| `npm run prisma:push`     | Push Prisma schema to the database           |
| `npm run prepare`         | Install Husky Git hooks                      |
| `npm run migrate`         | Run custom migration scripts using ts-node   |


## Environment Variables

| Variable                       | Description                                                                                             |
|--------------------------------|---------------------------------------------------------------------------------------------------------|
| `PORT`                         | The port on which the server will run. Default is `8000`.                                               |
| `DATABASE_URL`                 | The connection string for the database.                                                                 |
| `ACCESS_TOKEN_SECRET`          | Secret key for signing access tokens (JWT).                                                             |
| `REFRESH_TOKEN_SECRET`         | Secret key for signing refresh tokens (JWT).                                                            |
| `EMAIL_HOST`                   | SMTP server host for sending emails. Example: `smtp-relay.brevo.com`.                                   |
| `EMAIL_PORT`                   | SMTP server port. Default is `587`.                                                                     |
| `EMAIL_USER`                   | SMTP server username for authentication.                                                                |
| `EMAIL_PASS`                   | SMTP server password for authentication.                                                                |
| `EMAIL_FROM`                   | Default "from" email address for outgoing emails.                                                       |
| `FRONTEND_URL_FORGOT_PASSWORD` | URL to redirect users for password reset. Example: `http://localhost:8000/api/parent/reset-password`.   |
| `FRONTEND_URL_VERIFY_EMAIL`    | URL to redirect users for email verification. Example: `http://localhost:8000/api/parent/verify-email`. |

## Commit Message Guidelines

All commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/) specification with a Jira ticket prefix.

## Author

**Salem Shah**  
[GitHub](https://github.com/salemshah) | [Email](mailto:salemshahdev@gmail.com)