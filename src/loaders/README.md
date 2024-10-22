# 🟢 Loaders for Express API

![License](https://img.shields.io/badge/license-Private-green.svg)
![Node.js](https://img.shields.io/badge/node.js-20.0.0-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.5.4-blue.svg)
![Express](https://img.shields.io/badge/Express-4.17.1-lightgrey.svg)
![Swagger](https://img.shields.io/badge/Swagger-API--Docs-yellow.svg)
![Prometheus](https://img.shields.io/badge/Prometheus-Metrics-orange.svg)

## Table of Contents

- [Overview](#overview)
- [Loaders](#loaders)
    - [Express Loader](#express-loader)
    - [Metrics Loader](#metrics-loader)
    - [Swagger Loader](#swagger-loader)
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [License](#license)
- [Author](#author)

## Overview

This directory contains loaders that configure essential middleware and features for your Express.js application. Loaders help in setting up middleware, routes, metrics, and API documentation in a scalable and organized manner.

## Loaders

### Express Loader

The **Express Loader** is responsible for initializing core middleware and routing for the Express.js application. It includes security, compression, logging, and more to ensure optimal performance and security for the API.

**Features:**
- **Security:** Uses `helmet` for securing HTTP headers.
- **CORS:** Cross-Origin Resource Sharing is enabled with specific origins and credentials.
- **Compression:** Compresses HTTP responses using `compression` middleware.
- **Logging:** Logs HTTP requests with `morgan`.
- **Body Parsing:** Parses incoming JSON and URL-encoded data.
- **Cookie Parsing:** Parses cookies with `cookie-parser`.
- **API Routes:** Registers API routes for the application.

### Metrics Loader

The **Metrics Loader** tracks application performance using Prometheus. It exposes a `/metrics` endpoint that provides real-time performance data such as request durations and response statuses.

**Features:**
- **HTTP Request Tracking:** Monitors request durations and response statuses.
- **Prometheus Integration:** Provides a `/metrics` endpoint for Prometheus to scrape performance data.
- **Error Handling:** Logs errors during metrics retrieval.

### Swagger Loader

The **Swagger Loader** sets up interactive API documentation using Swagger. It loads the API documentation from a `swagger.yaml` file and exposes the documentation at `/api-docs`.

**Features:**
- **Swagger UI:** Serves the Swagger UI for interactive API documentation.
- **YAML Parsing:** Resolves and validates the `swagger.yaml` file to ensure accurate documentation.
