const {  createMongoConnection } = require('./utils');


class CloudBroker {

  constructor() {
  }
  
  async getBestResource (cpu, ram, hd) {
    const [mongodb, mongoClient] = await createMongoConnection();
    const collection = mongodb.collection('providers');
    const aggregation = [
      {
        "$unwind": "$vms"
      },
      {
        "$match": {
          "$nor": [
            {
              "vms.uso": 1
            },
            {
              "vms.cpu": {
                "$lt": cpu
              }
            },
            {
              "vms.ram": {
                "$lt": ram
              }
            },
            {
              "vms.hd": {
                "$lt": hd
              }
            }
          ]
        }
      },
      {
        "$project": {
          "ip": "$ip",
          "preco": "$vms.preco",
          "chave": "$vms.chave"
        }
      },
      {
        "$sort": {
          "preco": -1
        }
      },
      {
        "$group": {
          "_id": "$ip",
          "menor_preco": {
            "$last": "$preco"
          },
          "chave": {
            "$last": "$chave"
          }
        }
      }
    ];

    // Get best vm for each provider
    const vms = await collection.aggregate(aggregation).toArray();

    // Get best vm of all providers
    let bestVm = vms.length > 0 ? vms[0] : false;
    for (let i = 0; i < vms.length; i++) {
      if (bestVm.menor_preco > vms[i].menor_preco) {
        bestVm = vms[i];
      }
    }

    mongoClient.close();
    return bestVm
      ? { ip: bestVm._id, chave: bestVm.chave } 
      : { ip: "0.0.0.0", chave: -1 };
  }

  async getProviders () {
    const [mongodb, mongoClient] = await createMongoConnection();
    const collection = mongodb.collection('providers');
    const providers = await collection.find().toArray();
    mongoClient.close();
    return providers;  
  }

  async updateProvider (providerIP, provider) {
    const [mongodb, mongoClient] = await createMongoConnection();
    const collection = mongodb.collection('providers');

    await collection.updateOne(
      {
        ip: providerIP+':'+provider.porta,
      },
      {
        $set: {
          vms: provider.dados
        }
      },
      {
        upsert: true,
      }
    );

    mongoClient.close();
  }
}

module.exports = CloudBroker;
