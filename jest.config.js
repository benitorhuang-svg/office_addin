module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  coverageProvider: "v8",
  moduleNameMapper: {
    "^@shared/(.*)\\.js$": "<rootDir>/src/shared/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@config/(.*)\\.js$": "<rootDir>/src/config/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@infra/(.*)\\.js$": "<rootDir>/src/infra/$1",
    "^@infra/(.*)$": "<rootDir>/src/infra/$1",
    "^@agents/(.*)\\.js$": "<rootDir>/src/agents/$1",
    "^@agents/(.*)$": "<rootDir>/src/agents/$1",
    "^@orchestrator/(.*)\\.js$": "<rootDir>/src/orchestrator/$1",
    "^@orchestrator/(.*)$": "<rootDir>/src/orchestrator/$1",
    "^@tools/(.*)\\.js$": "<rootDir>/src/tools/$1",
    "^@tools/(.*)$": "<rootDir>/src/tools/$1",
    "^@adapters/(.*)\\.js$": "<rootDir>/src/adapters/$1",
    "^@adapters/(.*)$": "<rootDir>/src/adapters/$1",
  },
  moduleFileExtensions: ["js", "ts", "tsx", "json", "node"],
  setupFilesAfterEnv: ["<rootDir>/src/infra/__tests__/setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 50,
      lines: 80,
      statements: 80,
    },
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      isolatedModules: true
    }]
  },
};
