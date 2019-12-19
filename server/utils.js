const { MongoClient } = require('mongodb');

exports.createMongoConnection = async () => {
  const uri = `${process.env.MONGODB_URI || 'mongodb://localhost/cloud-broker-ufscar'})`;
  const mongoConnection = new MongoClient(uri, { ssl: true });
  const mongodb = (await mongoConnection.connect()).db();

  return [mongodb, mongoConnection]
};
