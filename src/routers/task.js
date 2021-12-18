const express = require('express');
const Task = require('../models/task')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router();

// we are going to cofigure express to parse the json for us
router.use(express.json());

// /tasks   return all the tasks
// /tasks?completed=true|false   return only completed and uncompleted tasks
router.get('/tasks', auth, async (req, res) => {

    console.log("GET:  tasks");

    console.log('In /tasks query=',req.query);

    const ownerID = req._id;

    try {
        // there are two ways to do this
        // Method 1:  return all the tasks with the userID we are looking for

        // const query = {
        //     owner: ownerID,
        //     // this funny stuff below is a conditional spread of an object
        //     // that is conditionally created based on if "completed" is 
        //     // a member of the params object, if not we leave the filter
        //     // off completely and get all tasks, otherwise we get the 
        //     // completed or not completed based on the param
        //     ...( ("completed" in req.query) && {completed: req.query.completed})
        // };

        // const docs = await Task.find(query);

        // docs.forEach( (task) => {
        //     console.log("Task: ", task.id, task.description, task.completed);
        // })

        //res.status(201).send(docs);
        
        //option 2:  use the populate method 
        
        const match = {
            ...( ("completed" in req.query) && {completed: req.query.completed})
        };

        await req.user.populate({
            path: 'tasks',
            match
        }); // populate that virtual field we created on user

        req.user.tasks.forEach( (task) => {
            console.log("Task: ", task.id, task.description, task.completed);
        })

        res.status(201).send(req.user.tasks);

        console.log("ok");

    } catch (e) {
        res.status(500).send(e);
        console.log("ERROR:", e);
    }
})

router.get('/tasks/:id', auth, async (req,res) => {

    const taskID = req.params.id;
    const ownerID = req._id;

    console.log("Seeking Task ID:", taskID, "Owned by:", ownerID);

    try {
        // findOne finds the first element that matches the query
        // we are looking for the first task that is owned by ownerID
        // taskID is provided by the caller
        // ownerID is provided by the auth layer
        const result = await Task.findOne({_id:taskID, owner: ownerID});

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

router.patch('/tasks/:id', auth, async (req, res) => {

    const taskID = req.params.id;
    const ownerID = req._id;

    console.log("Patching Task ID:", taskID, "Owned by:", ownerID);

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

        const task = await Task.findOne({_id: taskID, owner: ownerID});

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


router.get('/tasks/:id', auth, async (req,res) => {

    const taskID = req.params.id;
    const ownerID = req._id;

    console.log("Seeking Task ID:", taskID, "Owned by:", ownerID);

    try {
        // findOne finds the first element that matches the query
        // we are looking for the first task that is owned by ownerID
        // taskID is provided by the caller
        // ownerID is provided by the auth layer
        const result = await Task.findOne({_id:taskID, owner: ownerID});

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

router.delete('/tasks/:id', auth, async (req, res) => {

    // TODO:  When a task id is bad we are sending back 
    // a big complex error object - simplify that and only send
    // back minimal info

    const taskID = req.params.id;
    const ownerID = req._id;
    console.log("Delete task", taskID);

    try {

        const result = await Task.deleteOne( { _id:taskID, owner: ownerID });

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
})

module.exports = router;