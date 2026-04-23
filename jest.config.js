/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: false,
        tsconfig: {
          module: 'CommonJS',
          moduleResolution: 'node',
          esModuleInterop: true,
        },
      },
    ],
  },
  testMatch: ['**/backend/**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'backend/**/*.ts',
    '!backend/**/__tests__/**',
    '!backend/**/*.d.ts',
    '!backend/scripts/**',
    '!backend/infra/**',
    '!backend/specs/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  modulePathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/dist-server'],
};

export default config;
