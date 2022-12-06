import jestGlobalConfig from './jest.config'

jestGlobalConfig.testMatch = ['**/?(*.)+(e2e-test).ts']

export default jestGlobalConfig
