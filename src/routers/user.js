const express = require('express');
const User = require('../models/user');

const router = new express.Router();

// we are going to cofigure express to parse the json for us
router.use(express.json());

router.get('/users', async (req, res) => {
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

router.get('/users/:id', async (req,res) => {

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

router.patch('/users/:id', async (req, res) => {

    const _id = req.params.id;
    console.log("Patching User ID:", _id);

    // we want to make sure that they send in all the elements we expect

    // method returns an array of a given object's own enumerable property names
    // we are going to make sure the properties are there that we expect
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','password'];

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

        // we need to change the update process because the findByIdAndUpdate bypasses
        // the mongoose stuff, we need to do this with the traditional mongoose code so
        // we can layer in some middleware
        //const user = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true});

        // get the object from the database by id
        const user = await User.findById(req.params.id);

        if (!user) {
            console.log("Error: didn't find user", _id);
            return res.status(404).send(e); 
        }

        // updates array contains the object field names that
        // are being passed in, these are the ones they want to update
        // so for each of these, we'll update the user object by copying
        // over the object fields that they gave us to the user we just
        // got back from the database
        updates.forEach((update) => {
            user[update] = req.body[update];
        });

        // this is where the middleware will run to 
        // hash the password if needed
        await user.save();

        res.send(user);

    } catch (e) {

        console.log("Error: ", e)
        res.status(400).send(e);
    }
})

router.post('/users', async (req, res) => {

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

module.exports = router;