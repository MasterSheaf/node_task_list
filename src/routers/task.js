const express = require('express');
const Task = require('../models/task')

const router = new express.Router();

// we are going to cofigure express to parse the json for us
router.use(express.json());

router.get('/tasks', async (req, res) => {

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

router.get('/tasks/:id', async (req,res) => {

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

router.patch('/tasks/:id', async (req, res) => {

    const _id = req.params.id;
    console.log("Patching Task ID:", _id);

    try {

        const user = await Task.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true});

        if (!user) {
            console.log("Error: didn't find task", _id);
            return res.status(404).send(e); 
        }

        res.send(user);

    } catch (e) {

        console.log("Error: ", e)
        res.status(400).send(e);
    }
})

// we are going to use POST to create a new note
router.post('/tasks', async (req, res) => {

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

module.exports = router;