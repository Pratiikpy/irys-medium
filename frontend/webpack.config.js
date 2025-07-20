const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      "ajv/dist/compile/codegen": false,
    },
    alias: {
      "ajv-keywords": require.resolve("ajv-keywords"),
    },
  },
}; 