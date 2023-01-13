import { Config } from '@jest/types'
import { pathsToModuleNameMapper } from 'ts-jest'

const { compilerOptions } = require('../../tsconfig.base.json')

const transformIgnoreSources = ['@wagmi/core'].join('|')

const config: Config.InitialOptions = {
  detectOpenHandles: true,
  errorOnDeprecated: true,
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
  testMatch: ['**/?(*.)+(e2e-test|unit-test).ts'],
  testEnvironment: 'node',
  passWithNoTests: true,
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: process.cwd(),
  }),
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
