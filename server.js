import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy API requests to backend (adjust URL if needed)
app.use('/api', createProxyMiddleware({
  target: 'https://sbeamp.ampcustech.info',
  changeOrigin: true,
  secure: true, // Enable SSL verification
  pathRewrite: {
    '^/api': '/api', // Keep /api prefix
  },
}));

// Fallback to index.html for all routes (SPA routing)
// This is CRITICAL for React Router to work
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
  console.log(`Serving files from: ${path.join(__dirname, 'dist')}`);
  console.log(`API proxy configured for: https://sbeamp.ampcustech.info/api`);
});
