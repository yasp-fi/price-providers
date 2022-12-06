import { Config } from '@jest/types'

const transformIgnoreSources = [].join('|')

const config: Config.InitialOptions = {
  detectOpenHandles: true,
  errorOnDeprecated: true,
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  testMatch: ['**/?(*.)+(e2e-test|unit-test).ts'],
  testEnvironment: 'node',
  passWithNoTests: true,
  moduleNameMapper: {
    '@app/(.*)': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    `node_modules/(?!((jest-)?${transformIgnoreSources}))`,
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  verbose: true,
  json: true,
  coverageDirectory: '<rootDir>/coverage',
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
}

export default config
