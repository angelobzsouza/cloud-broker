const { MongoClient } = require('mongodb');

exports.createMongoConnection = async () => {
  const uri = `${process.env.MONGODB_URI || 'mongodb://localhost/cloud-broker-ufscar'})`;
  const mongoConnection = new MongoClient(uri, { 
    useUnifiedTopology: true ,
    useNewUrlParser: true,
  });
  mongoConnection.connect((err) => {
    console.log(err);
  });
  const mongodb = (await mongoConnection.connect()).db();

  return [mongodb, mongoConnection]
};
