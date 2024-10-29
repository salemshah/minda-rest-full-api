import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import initializeApp from '../app';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { Application } from 'express';

// Load environment variables for testing
dotenv.config({ path: '.env.test' });

// Mock External Dependencies
jest.mock('../utils/sendEmail', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

// Initialize Prisma Client
const prisma = new PrismaClient();

// Function to run Prisma migrations
const runMigrations = () => {
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  } catch (error) {
    console.log(error);
  }
};

let app: Application;

beforeAll(async () => {
  runMigrations();
  await prisma.$connect();
  await prisma.parent.deleteMany();
  console.log('All deleted from parent');
  app = await initializeApp();
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(() => {
  jest.clearAllMocks();
});

export { app };
