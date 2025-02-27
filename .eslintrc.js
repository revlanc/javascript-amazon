module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: ['naver', 'prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': 0
  }
};
