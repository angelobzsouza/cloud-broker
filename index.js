require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const CloudBroker = require('./server/cloudBroker');

app.get('/resource', async (req, res) => {
  try {
    res.send("Chubacca");
    const { cpu, ram, hd } = req.query;
    const cloudBroker = new CloudBroker();
    const bestProvider = await cloudBroker.getBestResource(cpu, ram, hd);
    res.send(bestProvider);
  } catch (e) {
    res.status(500).send({
      error: true,
      message: e.message
    });
  }
});

app.get('/providers', async (req, res) => {
  try {
    const cloudBroker = new CloudBroker();
    const providers = await cloudBroker.getProviders();
    res.send(providers);
  } catch (e) {
    res.status(500).send({
      error: true,
      message: e.message
    });
  }
});

app.post('/provider', async (req, res) => {
  try {
    const providerIP = (req.headers['x-forwarded-for'] || '').split(',').pop()
     || req.connection.remoteAddress
     || req.socket.remoteAddress
     || req.connection.socket.remoteAddress;

    const cloudBroker = new CloudBroker();
    await cloudBroker.updateProvider(providerIP, req.body);
    res.sendStatus(200);
  } catch (e) {
    res.status(500).send({
      error: true,
      message: e.message
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at localhost: ${process.env.PORT}`)
});
