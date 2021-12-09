"use strict";

// express is actually a function, not an object
const express = require('express');

// we need to run the database stuff so we require it which runs 
// the script, we don't return or export anything to set though
require('./db/database');

const User = require('./models/user');
const Task = require('./models/task')

const app = express();

// if there is an environment variable called PORT we'll use it
// if not then we'll default to 3000 - since we plan on deploying this
// to Heroku we'll have that environment variable there so we are ready
const port = process.env.PORT || 3000;

// we are going to cofigure express to parse the json for us
app.use(express.json());
  
app.get('*', (req, res) => {
    res.send('Page not found!');
});

// we are going to use POST to create a new note
app.post('/tasks', (req, res) => {

    console.log("POST: Task", req.body);
    
    // we are already getting the right format of object
    // from the post request so we can just feed into the
    // the model factory to get a new user
    const user = new Task(req.body);

    // push this to the database
    user.save().then( () => {
        res.status(201).send(req.body);
    }).catch( (e) => {
        res.status(400).send(e);
        console.log("ERROR:", e);
    });
})

// we are going to use POST to create a new note
app.post('/users', (req, res) => {

    console.log("POST: User", req.body);
    
    // we are already getting the right format of object
    // from the post request so we can just feed into the
    // the model factory to get a new user
    const user = new User(req.body);

    // push this to the database
    user.save().then( () => {
        res.status(201).send(req.body);
    }).catch( (e) => {
        res.status(400).send(e);
        console.log("ERROR:", e);
    });
})


app.listen(port, () => {
    console.log("Server Running on Port 3000");
});
