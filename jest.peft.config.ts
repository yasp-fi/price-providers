import jestGlobalConfig from './jest.config'

jestGlobalConfig.testMatch = ['**/?(*.)+(perf-test).ts']

export default jestGlobalConfig
