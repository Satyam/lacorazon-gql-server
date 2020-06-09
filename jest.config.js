module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/tests/*.test.[tj]s'],
  transform: {
    '^.+\\.[tj]s?$': 'babel-jest',
  },
  globalSetup: './src/tests/setup.js',
  globalTeardown: './src/tests/teardown.js',
};
