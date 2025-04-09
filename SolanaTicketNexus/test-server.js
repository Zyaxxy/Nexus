import express from 'express';
const app = express();
const port = 5000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is working!' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Test server listening on port ${port}`);
});