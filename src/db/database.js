const mongoose = require('mongoose')

const password = 'asTF34gh00tr67';
const databaseName = 'TodoDB';
const connectionURL = "mongodb+srv://sheaf:" + password + "@cluster0.ha99a.mongodb.net/" + databaseName + "?retryWrites=true&w=majority";

const mongoConnectOptions = { useNewUrlParser: true};

mongoose.connect(connectionURL, mongoConnectOptions);

