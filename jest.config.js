/** @type {import('jest').Config} */
module.exports = {
  ...require('./jest.config.base'),
  testMatch: ['**/tests/**/*.test.(ts|tsx|js)'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/src/$1'
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/dist/']
};
