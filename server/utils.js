const { MongoClient } = require('mongodb');

exports.createMongoConnection = async () => {
  const uri = `${process.env.MONGODB_URI || 'mongodb://localhost/cloud-broker-ufscar'})`;
  const mongoConnection = new MongoClient(uri, { 
    useUnifiedTopology: true ,
    useNewUrlParser: true,
    server: { auto_reconnect: true }
  });
  const mongodb = (await mongoConnection.connect()).db();
  console.log(mongodb);

  return [mongodb, mongoConnection]
};
