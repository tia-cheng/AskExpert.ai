module.exports = {
  port: 3000,
  allowedHosts: 'all',
  proxy: {
    '/api': 'http://localhost:3001'
  },
  headers: {
    'Access-Control-Allow-Origin': '*',
  }
};
