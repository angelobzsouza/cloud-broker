const { MongoClient } = require('mongodb');

exports.createMongoConnection = async () => {
  console.log(process.env.MONGODB_URI);
  const uri = `${process.env.MONGODB_URI || 'mongodb://localhost/cloud-broker-ufscar'})`;
  const mongoConnection = new MongoClient(uri, { 
    useUnifiedTopology: true 
  });
  const mongodb = (await mongoConnection.connect()).db();

  return [mongodb, mongoConnection]
};
