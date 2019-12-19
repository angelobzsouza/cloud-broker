require('dotenv').config();
require('node-json-color-stringify');
const readline = require('readline');
const fetch = require('node-fetch');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getInput(question) {
  return new Promise(function (resolve, reject) {
    const ask = function () {
      rl.question(question, function (answer) {
        res = parseInt(answer);
        resolve(res, reject);
      });
    };
    ask();
  });
}

async function showProviders () {
  const response = await fetch(`${process.env.CLOUDBROKER_URI}/providers`, {
    method: 'GET',
  });

  return response;
}

async function getBestVm (cpu, ram, hd) {
  cpu = parseInt(cpu, 10);
  ram = parseInt(ram, 10);
  hd = parseInt(hd, 10);

  const response = await fetch(`${process.env.CLOUDBROKER_URI}/resource?cpu=${cpu}&ram=${ram}&hd=${hd}`, {
    method: 'GET',
  });

  return response;
}

async function requestVm (port, key) {
  key = parseInt(key, 10);

  const response = await fetch(`http://localhost:${port}/resource/use`, {
    method: 'POST',
    body: JSON.stringify({ key }),
    headers: { 'Content-Type': 'application/json' }
  });

  return response;
}

async function releaseVm (port, key) {
  key = parseInt(key, 10);

  const response = await fetch(`http://localhost:${port}/resource/release`, {
    method: 'POST',
    body: JSON.stringify({ key }),
    headers: { 'Content-Type': 'application/json' }
  });

  return response;
}

(async function start() {
  while (true) {
    let opt = await getInput(`1 - Show providers\n2 - Find best virtual machine\n3 - Request best virtual machine\n4 - Release virtual machine\n5 - Exit\n`);

    switch (opt) {
      case 1:
        try {
          const response = await showProviders();
          const providers = await response.json();
          console.log(JSON.colorStringify(providers, null, 2));
        } catch (e) {
          console.log('Error to request provider');
          console.log(e);
        }
      break;
      case 2:
        try {
          var cpu = await getInput('CPUs quantity: ');
          var ram = await getInput('RAM quantity: ');
          var hd = await getInput('HD quantity: ');
          const response = await getBestVm(cpu, ram, hd);
          const bestVm = await response.json();

          if (bestVm.key == -1) {
            console.log('There is no free virtual machine with this config');
          }
          else {
            console.log(JSON.colorStringify(bestVm, null, 2));
          }
        } catch (e) {
          console.log('Error to get best virtual machine');
          console.log(e);
        }
      break;
      case 3:
        try {
          var port = await getInput('Provider port: ');
          var key = await getInput('Virtual machine key: ');

          const data = await requestVm(port, key);
          const response = await data.json();

          if (response.error) {
            console.log(response.message);
          } else {
            console.log(`The virtual machine ${key} of provider at ${port} start to be use`);
          }
        } catch (e) {
          console.log('Error to use virtual machine');
          console.log(e);
        }
      break;
      case 4:
        try {
          var port = await getInput('Provider port: ');
          var key = await getInput('Virtual machine key: ');

          const data = await releaseVm(port, key);
          const response = await data.json();

          if (response.error) {
            console.log(response.message);
          } else {
            console.log(`The virtual machine ${key} of provider at ${port} was released`);
          }
        } catch (e) {
          console.log('Error to release virtual machine');
          console.log(e);
        }
      break;
      case 5:
        process.exit();
      break;
      default:
        console.log('Invalid option, please try again!');
      break;
    }
  }
})();