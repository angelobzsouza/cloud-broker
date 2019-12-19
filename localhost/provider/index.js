require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const Provider = require('./provider');
const provider = new Provider(process.argv[2]);

app.post('/resource/use', async (req, res) => {
  try {
    const { key } = req.body;
    const response = await provider.useVm(key);
    
    if (response.error) {
      res.status(response.statusCode).send({
        error: true,
        message: response.message
      });
      return;
    }

    res.send({ error: false });
  } catch (e) {
    res.status(500).send({
      error: true,
      message: e.message
    });
  }
});

app.post('/resource/release', async (req, res) => {
  try {
    const { key } = req.body;
    const response = await provider.releaseVm(key);

    if (response.error) {
      res.status(response.statusCode).send({
        error: true,
        message: response.message
      });
      return;
    }

    res.send({ error: false });
  } catch (e) {
    res.status(500).send({
      error: true,
      message: e.message
    });
  }
});

app.listen(process.argv[2], () => {
  console.log(`Provider is running at: ${process.argv[2]}`)
});
