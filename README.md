# CLOUD BROKER

This project was developed in distribuited systems class. The main goal was to simulate a cloud broker that receive some virtual machine configuration and responde with cheapest one available.

## Run

To run project, it's necessary to install NodeJS, npm and deploy the Cloud Broker in some cloud service. It was tested using [Heroku](https://heroku.com).

When the cloud broker is deployed, change the .env-example with your config and create the .env file. Note that PORT and MONGODB_URI are used by the cloud service, you need to indicate only the CLOUDBROKER_URI.

After this, in the root folder run
```sh
npm install
```

to create new providers instances, open a new command line window and run
```sh
npm run start:provider
```

Finally, to run the client, in another command line windoe run
```sh
npm run start:client
```

When a provider is initiated, it create randoms vms and send to cloud broker. When you access the cloud broker root path, the database with vms are cleaned.