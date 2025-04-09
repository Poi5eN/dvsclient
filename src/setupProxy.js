const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      // target: 'https://dvsserver.onrender.com',
      target: 'https://dvsserver.onrender.com',
      changeOrigin: true,
    })
  );
};