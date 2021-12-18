const express = require('express');
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router();

// we are going to cofigure express to parse the json for us
router.use(express.json());

router.get('/tasks', auth, async (req, res) => {

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

    // we want to make sure that they send in only the elements we expect

    // method returns an array of a given object's own enumerable property names
    // we are going to make sure the properties are there that we expect
    const updates = Object.keys(req.body);
    const allowedUpdates = ['completed','description'];

    // tests whether all elements in the array pass the test implemented by the provided function
    const isValidOperation = updates.every( (update) => {
        console.log("Checking for", update);
        // determines whether our array includes the value among its entries
        return allowedUpdates.includes(update);
    });

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates'});
    }

    try {

        const task = await Task.findById(req.params.id);

        if (!task) {
            console.log("Error: didn't find task", _id);
            return res.status(404).send(e); 
        }

        updates.forEach((update) => {
            task[update] = req.body[update];
        });

        await task.save();

        res.send(task);

    } catch (e) {

        console.log("Error: ", e)
        res.status(400).send(e);
    }
})

// we are going to use POST to create a new task
// since we are authenticated if we get this far
// we can make sure we set this task to be associated with
// the currenyly logged in user
router.post('/tasks', auth, async (req, res) => {

    console.log("POST: task", req.body);
    
    // we are already getting the right format of object
    // from the post request so we can just feed into the
    // the model factory to get a new task
    //const task = new Task(req.body);

    const task = new Task({
        ...req.body, // spread the whole body object here - fancy copy
        owner: req.user._id // object
    });

    try {
        await task.save();
        res.status(201).send(task);
    }catch (e) {
        res.status(400).send(e);
        console.log("ERROR:", e);
    }
})

module.exports = router;