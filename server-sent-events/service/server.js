import express from 'express';
import json from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true
    }
));
app.use(json());

let clients = [];

// In-memory store for stock prices
let stockPrices = {};

app.post('/stocks/webhook', (req, res) => {
  const { symbol, price } = req.body;

  stockPrices[symbol] = price;

// notify all connected clients of the new price
  clients.forEach(client => {
    client.res.write(`data: ${JSON.stringify({ symbol, price })}\n\n`);
  });

  console.log(`Stock price update received for ${symbol}`,stockPrices);

  return res.json({ message: `Stock price update received for ${symbol}` });
});

// this is the sse part
app.get('/stocks/price-updates', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  Object.keys(stockPrices).forEach(symbol => {
    res.write(`data: ${JSON.stringify({ symbol, price: stockPrices[symbol] })}\n\n`);
  });

  // list of subscribers
  clients.push({ res });

  req.on('close', () => {
    clients = clients.filter(client => client.res !== res);
  });
});
console.log("no of clinets",clients.length);

app.listen(port, () => {
  console.log(`Running on port: ${port}`);
});
