const {  createMongoConnection } = require('./utils');


class CloudBroker {

  constructor() {

  }

  async start () {
    const [mongodb, mongoClient] = await createMongoConnection();
    const collection = mongodb.collection('providers');
    await collection.deleteMany({});
  }
  
  async getBestResource (cpu, ram, hd) {
    const [mongodb, mongoClient] = await createMongoConnection();
    const collection = mongodb.collection('providers');

    const unwind = {
      "$unwind": "$vms"
    };
    const match = {
      "$match": {
        "$nor": [
          {
            "vms.uso": 1
          },
          {
            "vms.cpu": {
              "$lt": parseInt(cpu, 10)
            }
          },
          {
            "vms.ram": {
              "$lt": parseInt(ram, 10)
            }
          },
          {
            "vms.hd": {
              "$lt": parseInt(hd, 10)
            }
          }
        ]
      }
    };
    const project = {
      "$project": {
        "porta": "$porta",
        "preco": "$vms.preco",
        "chave": "$vms.chave"
      }
    };
    const sort = {
      "$sort": {
        "preco": -1
      }
    };
    const group = {
      "$group": {
        "_id": "$porta",
        "menor_preco": {
          "$last": "$preco"
        },
        "chave": {
          "$last": "$chave"
        }
      }
    };

    // Get best vm for each provider
    const vms = await collection.aggregate([unwind, match, project, sort, group, ]).toArray();

    // Get best vm of all providers
    let bestVm = vms.length > 0 ? vms[0] : false;
    for (let i = 0; i < vms.length; i++) {
      if (bestVm.menor_preco > vms[i].menor_preco) {
        bestVm = vms[i];
      }
    }

    mongoClient.close();
    return bestVm
      ? { porta: bestVm._id, chave: bestVm.chave } 
      : { porta: "0000", chave: -1 };
  }

  async getProviders () {
    const [mongodb, mongoClient] = await createMongoConnection();
    const collection = mongodb.collection('providers');
    const providers = await collection.find().toArray();
    mongoClient.close();
    return providers;  
  }

  async updateProvider (provider) {
    const [mongodb, mongoClient] = await createMongoConnection();
    const collection = mongodb.collection('providers');

    await collection.updateOne(
      {
        porta: provider.porta,
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
