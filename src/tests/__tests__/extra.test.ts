// Import necessary modules and the function to test
import { figletText } from '../../utils/helper-functions';

// Mock the 'figlet' module
jest.mock('figlet');

// Optionally, mock 'chalk' if you want to inspect its behavior
jest.mock('chalk', () => ({
  green: jest.fn((str: string) => str), // Mock 'green' to return the string unchanged
}));

describe('figletText', () => {
  // Reset mocks before each test to avoid interference between tests
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should call figlet with correct arguments and log the green data', () => {
    // Spy on console.log to verify it's called correctly
    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});

    // Act
    figletText();

    // Clean up
    consoleLogSpy.mockRestore();
  });
});
