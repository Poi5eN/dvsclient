const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      // target: 'https://eserver-i5sm.onrender.com',
      target: 'https://eserver-i5sm.onrender.com',
      changeOrigin: true,
    })
  );
};