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
            "vms.use": 1
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
        "key": "$key",
        "price": "$vms.price",
        "key": "$vms.key"
      }
    };
    const sort = {
      "$sort": {
        "price": -1
      }
    };
    const group = {
      "$group": {
        "_id": "$port",
        "lowestPrice": {
          "$last": "$price"
        },
        "key": {
          "$last": "$key"
        }
      }
    };

    // Get best vm for each provider
    const vms = await collection.aggregate([unwind, match, project, sort, group, ]).toArray();

    console.log(vms);

    // Get best vm of all providers
    let bestVm = vms.length > 0 ? vms[0] : false;
    for (let i = 0; i < vms.length; i++) {
      if (bestVm.lowestPrice > vms[i].lowestPrice) {
        bestVm = vms[i];
      }
    }

    mongoClient.close();
    return bestVm
      ? { port: bestVm._id, key: bestVm.key } 
      : { port: "0000", key: -1 };
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
        port: provider.port,
      },
      {
        $set: {
          vms: provider.data
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
