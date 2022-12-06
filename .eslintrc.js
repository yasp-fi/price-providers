module.exports = {
  env: {
    node: true,
    'jest/globals': true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
  },
  plugins: ['@typescript-eslint', 'prettier', 'jest', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:promise/recommended',
    'standard',
    'prettier',
  ],
  globals: {
    AbortController: true,
    NodeJS: true,
  },
  rules: {
    'prettier/prettier': 'error',
    'no-unused-vars': 'off',
    'no-undef': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'jest/no-conditional-expect': 'off',
    'jest/expect-expect': 'off',
    'n/handle-callback-err': 'off',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
    'no-console': 'error',
  },
}
