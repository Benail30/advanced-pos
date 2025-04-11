const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const open = require('open');

const app = express();
const PORT = 3001;

// Proxy all requests to Drizzle Studio
app.use('/', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  ws: true,
  logLevel: 'debug',
}));

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
  console.log('Opening browser...');
  open(`http://localhost:${PORT}`);
}); 