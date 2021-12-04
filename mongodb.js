const mongodb = require('mongodb');

// get access to the client 
const MongoClient = mongodb.MongoClient;

// setup stuff
// 'localhost' causes some issues so we type out the whole IP here
const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';
const mongoConnectOptions = { useNewUrlParser: true };

MongoClient.connect(connectionURL, 
                    mongoConnectOptions, 
                    (error, client) => {
    if (error) {
        console.log('Unable to connect to the database');
        return;
    }

    console.log('connected correctly');

    // get a reference to the db we want to connect to
    // it'll automatically create it for us if it doesn't exist
    const db = client.db(databaseName);

    // insert a document
    db.collection('users').insertOne({
        name: 'Scott',
        age: 48
    });

})

