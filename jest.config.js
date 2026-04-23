/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@shared/(.*)\\.js$': '<rootDir>/src/shared/$1',
    '^@infra/(.*)\\.js$': '<rootDir>/src/infra/$1',
    '^@agents/(.*)\\.js$': '<rootDir>/src/agents/$1',
    '^@adapters/(.*)\\.js$': '<rootDir>/src/adapters/$1',
    '^@orchestrator/(.*)\\.js$': '<rootDir>/src/orchestrator/$1',
    '^@api/(.*)\\.js$': '<rootDir>/src/api/$1',
    '^@config/(.*)\\.js$': '<rootDir>/src/config/$1',
    '^@tools/(.*)\\.js$': '<rootDir>/src/tools/$1',
    '^@components/(.*)\\.js$': '<rootDir>/src/client/components/$1',
    '^@services/(.*)\\.js$': '<rootDir>/src/client/services/$1',
    '^@atoms/(.*)\\.js$': '<rootDir>/src/client/components/atoms/$1',
    '^@molecules/(.*)\\.js$': '<rootDir>/src/client/components/molecules/$1',
    '^@organisms/(.*)\\.js$': '<rootDir>/src/client/components/organisms/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@infra/(.*)$': '<rootDir>/src/infra/$1',
    '^@agents/(.*)$': '<rootDir>/src/agents/$1',
    '^@adapters/(.*)$': '<rootDir>/src/adapters/$1',
    '^@orchestrator/(.*)$': '<rootDir>/src/orchestrator/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@tools/(.*)$': '<rootDir>/src/tools/$1',
    '^@components/(.*)$': '<rootDir>/src/client/components/$1',
    '^@services/(.*)$': '<rootDir>/src/client/services/$1',
    '^@atoms/(.*)$': '<rootDir>/src/client/components/atoms/$1',
    '^@molecules/(.*)$': '<rootDir>/src/client/components/molecules/$1',
    '^@organisms/(.*)$': '<rootDir>/src/client/components/organisms/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        diagnostics: false,
        tsconfig: {
          module: 'ESNext',
          moduleResolution: 'node16',
          esModuleInterop: true,
        },
      },
    ],
  },
  testMatch: ['**/src/**/__tests__/**/*.test.ts'],
  collectCoverage: false,
  modulePathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/dist-server'],
};

export default config;
