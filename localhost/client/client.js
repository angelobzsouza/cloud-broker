require('dotenv').config();
const readline = require('readline');
const fetch = require('node-fetch');
const { inspect } = require('util');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getInput(question) {
  return new Promise(function (resolve, reject) {
    var ask = function () {
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

async function requestVm (porta, chave) {
  chave = parseInt(chave, 10);

  const response = await fetch(`http://localhost:${porta}/resource/use`, {
    method: 'POST',
    body: JSON.stringify({ chave }),
    headers: { 'Content-Type': 'application/json' }
  });

  return response;
}

async function releaseVm (porta, chave) {
  chave = parseInt(chave, 10);

  const response = await fetch(`http://localhost:${porta}/resource/release`, {
    method: 'POST',
    body: JSON.stringify({ chave }),
    headers: { 'Content-Type': 'application/json' }
  });

  return response;
}

(async function start() {
  while (true) {
    let opc = await getInput(`1 - Mostrar Provedores\n2 - Encontrar Melhor Maquina Virtual\n3 - Requisitar Maquina Virtual\n4 - Liberar Maquina Virtual\n5 - Sair\n`);

    switch (opc) {
      case 1:
        try {
          const response = await showProviders();
          const providers = await response.json();
          console.log(inspect(providers, {depth: 999}));
        } catch (e) {
          console.log('Erro ao requisitar provedores');
          console.log(e);
        }
      break;
      case 2:
        try {
          var cpu = await getInput('Quantidade de CPUs: ');
          var ram = await getInput('Quantidade de RAM: ');
          var hd = await getInput('Quantidade de HD: ');
          const response = await getBestVm(cpu, ram, hd);
          const bestVm = await response.json();

          if (bestVm.chave == -1) {
            console.log('Não existe nenhuma maquina virtual disponivel que atende aos requistos');
          }
          else {
            console.log(inspect(bestVm, {depth: 999}));
          }
        } catch (e) {
          console.log('Erro ao requisitar provedores');
          console.log(e);
        }
      break;
      case 3:
        try {
          var porta = await getInput('Porta do provedor: ');
          var chave = await getInput('Chave da maquina virtual: ');

          const data = await requestVm(porta, chave);
          const response = await data.json();

          if (response.error) {
            console.log(response.message);
          } else {
            console.log(`A maquina virtual ${chave} do provedor da porta ${porta} começou a ser usada`);
          }
        } catch (e) {
          console.log('Erro ao utilizar maquina virtual');
          console.log(e);
        }
      break;
      case 4:
        try {
          var porta = await getInput('Porta do provedor: ');
          var chave = await getInput('Chave da maquina virtual: ');

          const data = await releaseVm(porta, chave);
          const response = await data.json();

          if (response.error) {
            console.log(response.message);
          } else {
            console.log(`A maquina virtual ${chave} do provedor da porta ${porta} foi liberada`);
          }
        } catch (e) {
          console.log('Erro ao liberar maquina virtual');
          console.log(e);
        }
      break;
      case 5:
        process.exit();
      break;
      default:
        console.log('Opcao invalida, tente novamente!');
      break;
    }
  }
})();