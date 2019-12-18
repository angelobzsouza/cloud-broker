const fetch = require('node-fetch');
const { getRandomInt } = require('../utils');

class Provider {

  constructor (porta) {
    this.porta = porta;
    this.vms = [];
    // Create provider vms
    const qtdVms = getRandomInt(1, 10);
    for (let i = 0; i < qtdVms; i++) {
      const vm = {
        chave: i.toString(),
        cpu: getRandomInt(1, 64),
        ram: getRandomInt(8, 4096),
        hd: getRandomInt(16, 60000),
        preco: getRandomInt(1, 10000),
        uso: 0,
      }
      this.vms.push(vm);
    }
    
    this.divulga();
  }

  async divulga () {
    const providerJson = {
      porta: this.porta,
      dados: this.vms
    }

    const response = await fetch(`${process.env.CLOUDBROKER_URI}/provider`, {
      method: 'POST',
      body: JSON.stringify(providerJson),
      headers: { 'Content-Type': 'application/json' }
    });

    return response;
  }

  async useVm (chave) {
    if (chave > this.vms.length - 1) {
      return {
        error: true,
        statusCode: 404,
        message: 'Vitural machine not found'
      }
    }

    if (this.vms[chave].uso) {
      return {
        error: true,
        statusCode: 400,
        message: 'Vitural machine is in use'
      }
    }

    this.vms[chave].uso = 1;
    await this.divulga();
    return {
      error: false
    };
  }

  async releaseVm (chave) {
    if (chave > this.vms.length - 1) {
      return {
        error: true,
        statusCode: 404,
        message: 'Vitural machine not found'
      }
    }

    if (!this.vms[chave].uso) {
      return {
        error: true,
        statusCode: 400,
        message: 'Vitural machine is not in use'
      }
    }

    this.vms[chave].uso = 0;
    await this.divulga();
    return {
      error: false
    };
  }
}

module.exports = Provider;
