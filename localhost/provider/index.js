require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const Provider = require('./provider');
const provider = new Provider();
provider.start();

app.get('/resource', async (req, res) => {

});

app.listen(process.argv[2], () => {
  console.log(`Provider is running at: ${process.argv[2]}`)
});
