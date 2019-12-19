const fetch = require('node-fetch');
const { getRandomInt } = require('../utils');

class Provider {

  constructor (port) {
    this.port = port;
    this.vms = [];
    // Create provider vms
    const qtdVms = getRandomInt(1, 10);
    for (let i = 0; i < qtdVms; i++) {
      const vm = {
        key: i.toString(),
        cpu: getRandomInt(1, 64),
        ram: getRandomInt(8, 4096),
        hd: getRandomInt(16, 60000),
        price: getRandomInt(1, 10000),
        use: 0,
      }
      this.vms.push(vm);
    }
    
    this.publish();
  }

  async publish () {
    const providerJson = {
      port: this.port,
      data: this.vms
    }

    const response = await fetch(`${process.env.CLOUDBROKER_URI}/provider`, {
      method: 'POST',
      body: JSON.stringify(providerJson),
      headers: { 'Content-Type': 'application/json' }
    });

    return response;
  }

  async useVm (chave) {
    if (key > this.vms.length - 1) {
      return {
        error: true,
        statusCode: 404,
        message: 'Vitural machine not found'
      }
    }

    if (this.vms[chave].use) {
      return {
        error: true,
        statusCode: 400,
        message: 'Vitural machine is in use'
      }
    }

    this.vms[chave].use = 1;
    await this.publish();
    return {
      error: false
    };
  }

  async releaseVm (chave) {
    if (key > this.vms.length - 1) {
      return {
        error: true,
        statusCode: 404,
        message: 'Vitural machine not found'
      }
    }

    if (!this.vms[chave].use) {
      return {
        error: true,
        statusCode: 400,
        message: 'Vitural machine is not in use'
      }
    }

    this.vms[chave].use = 0;
    await this.publish();
    return {
      error: false
    };
  }
}

module.exports = Provider;
