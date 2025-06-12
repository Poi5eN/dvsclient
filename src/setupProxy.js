const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      // target: 'https://api.digitalvidyasaarthi.in',
      target: 'https://api.digitalvidyasaarthi.in',
      changeOrigin: true,
    })
  );
};