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
  
app.get('/users', async (req, res) => {
    console.log("GET:  users");
    try {
        const docs = await User.find({});
        console.log("ok");
        res.status(201).send(docs);
    } catch (e) {
        res.status(500).send(e);
        console.log("ERROR:", e);
    }
})

app.get('/users/:id', async (req,res) => {

    const _id = req.params.id;
    console.log("Seeking User ID:", _id);

    try {

        const result = await User.findById(_id);

        if (result) {
            console.log("ok");
            res.status(201).send(result);
        } else {
            console.log("Not found");
            res.status(404).send("Not Found");
        }

    } catch (e) {
        res.status(500).send(e);
        console.log("ERROR:", e);
    }
});

app.get('/tasks', async (req, res) => {

    console.log("GET:  tasks");

    try {
        const docs = await Task.find({});
        console.log("ok");
        res.status(201).send(docs);
    } catch (e) {
        res.status(500).send(e);
        console.log("ERROR:", e);
    }
})

app.get('/tasks/:id', async (req,res) => {

    const _id = req.params.id;
    console.log("Seeking Task ID:", _id);

    try {

        const result = await Task.findById(_id);

        if (result) {
            console.log("ok");
            res.status(201).send(result);
        } else {
            console.log("Not found");
            res.status(404).send("Not Found");
        }

    } catch (e) {
        res.status(500).send(e);
        console.log("ERROR:", e);
    }
});

app.get('*', (req, res) => {
    res.send('Page not found!');
});

// we are going to use POST to create a new note
app.post('/tasks', async (req, res) => {

    console.log("POST: task", req.body);
    
    // we are already getting the right format of object
    // from the post request so we can just feed into the
    // the model factory to get a new user
    const task = new Task(req.body);

    try {
        await task.save();
        res.status(201).send(task);
    }catch (e) {
        res.status(400).send(e);
        console.log("ERROR:", e);
    }
})

// we are going to use POST to create a new note
app.post('/users', async (req, res) => {

    console.log("POST: User", req.body);
    
    // we are already getting the right format of object
    // from the post request so we can just feed into the
    // the model factory to get a new user
    const user = new User(req.body);

    try {
        await user.save();
        res.status(201).send(user);
    }catch (e) {
        res.status(400).send(e);
        console.log("ERROR:", e);
    }
})


app.listen(port, () => {
    console.log("Server Running on Port 3000");
});
