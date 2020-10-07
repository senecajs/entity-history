module.exports = {
  extends: 'eslint:recommended',
  env: {
    node: true
  },
  parserOptions: {
    ecmaVersion: 8
  },
  rules: {
    'no-console': 0
  },
  globals: {
    Promise: 'readonly'
  }
}
