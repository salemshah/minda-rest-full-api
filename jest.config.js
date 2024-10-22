/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    transform: {"^.+.tsx?$": ["ts-jest", {}],},
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    clearMocks: true,
    // Configure the module directories
    moduleDirectories: ['node_modules', 'src'],
    setupFilesAfterEnv: ['<rootDir>/src/tests/jest.setup.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    testPathIgnorePatterns: ['/node_modules/', '/build/'],
};
