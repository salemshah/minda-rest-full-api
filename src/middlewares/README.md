# 🟢 Express Middleware Collection

![License](https://img.shields.io/badge/license-Private-green.svg)
![Node.js](https://img.shields.io/badge/node.js-20.0.0-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.5.4-blue.svg)
![Express](https://img.shields.io/badge/Express-4.17.1-lightgrey.svg)
![Prisma](https://img.shields.io/badge/Prisma-5.20.0-brightgreen.svg)


## Table of Contents

- [Overview](#overview)
- [Middleware Components](#middleware-components)
    - [Error Handler Middleware](#error-handler-middleware)
    - [Metrics Middleware](#metrics-middleware)
    - [Validation Middleware](#validation-middleware)
    - [NotFound Handler Middleware](#notfound-handler-middleware)
- [Author](#author)
## Overview

This **Express Middleware Collection** includes essential middlewares for handling errors, request validation,
performance metrics, and 404 responses in your Express.js applications. These middlewares enhance security, performance,
and robustness of your API.

## Middleware Components

### Error Handler Middleware

The **Error Handler Middleware** centralizes error handling in the application. It captures and processes both custom
errors (`CustomError`) and Prisma-related errors, ensuring uniform and informative error responses. Additionally, it
logs errors using a logger for better debugging and troubleshooting.

**Features:**

- Captures and handles custom and Prisma errors
- Logs error details (stack trace, route, method, IP)
- Sends informative error responses
- Stack trace included in development mode

---

### Metrics Middleware

The **Metrics Middleware** tracks performance metrics like request duration and response status codes. It leverages the
Prometheus `httpRequestDurationHistogram` to provide insights into the performance of various routes, helping monitor
and optimize your API’s performance.

**Features:**

- Measures request duration and status codes
- Exposes metrics for integration with Prometheus or other monitoring tools
- Helps identify performance bottlenecks

---

### Validation Middleware

The **Validation Middleware** ensures that incoming requests are validated according to the defined schema using `Zod`.
It prevents invalid data from reaching the application by validating the request body and returning appropriate error
messages when validation fails.

**Features:**

- Validates request body using Zod schema
- Returns detailed validation errors for invalid requests
- Ensures data integrity across your API

---

### NotFound Handler Middleware

The **NotFound Handler Middleware** handles all requests to undefined routes. It returns a 404 status code and a "
Resource not found" message, ensuring that clients receive appropriate feedback when they attempt to access non-existent
endpoints.

**Features:**

- Handles all undefined routes
- Returns 404 error with a user-friendly message

---

## Author

**Salem Shah**  
[GitHub](https://github.com/salemshah) | [Email](mailto:salemshahdev@gmail.com)