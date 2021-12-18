const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router();

// we are going to cofigure express to parse the json for us
router.use(express.json());

// GET User Profile
router.get('/users/me', auth, async (req, res) => {

    console.log("GET:  logged in users profile");

    try {           
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }

})

// DELETE - delete a user by id
router.delete('/users/me', auth, async (req,res) => {

    console.log("Delete user", req._id);

    try {

        console.log("before remove");

        const result = await req.user.remove(req._id);

        console.log("after remove");

        // the following works the same as before but is simpler

        //await req.user.remove()

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

// PATCH User Info
router.patch('/users/:id', auth, async (req, res) => {

    console.log("Patching User ID:", req._id);

    // we want to make sure that they send in only the elements we expect

    // method returns an array of a given object's own enumerable property names
    // we are going to make sure the properties are there that we expect
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','password','age'];

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

        // we already have the user from the authentication
        // const user = await User.findById(req.params.id);

        // this should never happen now
        if (!req.user) {
            console.log("Error: didn't find user", _id);
            return res.status(404).send(e); 
        }

        // updates array contains the object field names that
        // are being passed in, these are the ones they want to update
        // so for each of these, we'll update the user object by copying
        // over the object fields that they gave us to the user we just
        // got back from the database
        updates.forEach((update) => {
            req.user[update] = req.body[update];
        });

        // this is where the middleware will run to 
        // hash the password if needed
        await req.user.save();

        res.send(req.user);

    } catch (e) {

        console.log("Error: ", e)
        res.status(400).send(e);
    }
})

// POST Login - this is the route the user will use to login
router.post('/users/login', async (req, res) => {

    console.log("POST: User Login", req.body);

    try {

        const user = await User.findByCredentials(req.body.email, req.body.password);

        if (!user) {
            console.log("error matching user or password")
            res.send({'error':'unable to login'});
        } else {

            const token = await user.generateAuthToken();

            console.log("login ok")
    
            res.send( {user, token} ); // send the user and token back to see what happens for now
            // note that in the above we are using the object shorthand notation
            // I could have written this instead
            // res.send( {user:user, token:token});
        }
    }catch (e) {

        res.status(400).send(e);
        console.log("ERROR:", e);
    }
})

// POST Log Out
router.post('/users/logout', auth, async (req, res) => {
    
    console.log("POST: Logout", req.body);

    // we have this stuff from the authentication middleware
    const tokenToRemove = req.token;

    try {

        // we need to remove the token from the array of tokens on user 
        // and then update the user in the database
        req.user.tokens = req.user.tokens.filter( (token) => {
            return token.token !== tokenToRemove;
        })

        // update the database
        await req.user.save();

        res.status(200).send({'logout':'ok'});

    } catch (e) {

        res.status(500).send({'status':'Error logging out'});
        console.log(e);
    }
})

// POST Log out of everywhere at once
router.post('/users/logoutall', auth, async (req, res) => {
    
    console.log("POST: Logout All", req.body);

    try {

        // we need to remove the token from the array of tokens on user 
        // and then update the user in the database
        req.user.tokens = [];

        // update the database
        await req.user.save();

        res.status(200).send({'logout all':'ok'});

    } catch (e) {

        res.status(500).send({'status':'Error logging out'});
        console.log(e);
    }
})

// CREATE: A New User
router.post('/users', async (req, res) => {

    console.log("POST: User", req.body);
    
    // we are already getting the right format of object
    // from the post request so we can just feed into the
    // the model factory to get a new user
    const user = new User(req.body);

    try {

        // TODO: If the user's email address already exists
        // then user.generateAuthToken() will generate an 
        // exception.  This is ok, but the exception that gets
        // caught here and sent to the caller isn't clear
        // I think this and the next comment down are signals we 
        // should clean this mechanism up a bit

        const token = await user.generateAuthToken();

        // TODO: this feels bad, but since user.generateAuthToken() calls save
        // already we don't need to do this again here.  probably a way
        // to make this cleaner
        //await user.save();

        res.status(201).send( {user, token} );

    }catch (e) {
        res.status(400).send(e);
        console.log("ERROR:", e);
    }
})

module.exports = router;