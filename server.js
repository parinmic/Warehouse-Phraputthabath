import express from 'express';
import { readFileSync } from 'fs';

// Load .env manually
try {
  const env = readFileSync('.env', 'utf8');
  for (const line of env.split('\n')) {
    const [key, ...val] = line.split('=');
    if (key && val.length) process.env[key.trim()] = val.join('=').trim();
  }
} catch {}

const app = express();
app.use(express.json({ limit: '25mb' }));

// Serve React build
app.use(express.static('dist'));

// SPA fallback
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(new URL('./dist/index.html', import.meta.url).pathname);
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 http://localhost:${PORT}`));
