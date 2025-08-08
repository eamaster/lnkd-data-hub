/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          target: 'ES2022',
          module: 'commonjs'
        },
        diagnostics: false,
        useESM: false
      }
    ]
  },
  transformIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  collectCoverageFrom: ['**/*.{ts,tsx,js}', '!**/node_modules/**', '!**/dist/**'],
  setupFiles: ['<rootDir>/tests/setupPolyfills.js']
};
