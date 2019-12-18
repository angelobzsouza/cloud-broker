const { MongoClient } = require('mongodb');

exports.createMongoConnection = async () => {
  const uri = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/cloudbroker`;
  const mongoConnection = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const mongodb = (await mongoConnection.connect()).db();

  return [mongodb, mongoConnection]
};
