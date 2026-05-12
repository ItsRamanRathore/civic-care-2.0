module.exports = {
  testEnvironment: 'node',
  verbose: true,
  setupFiles: ['./tests/env.js'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 120000,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
};
