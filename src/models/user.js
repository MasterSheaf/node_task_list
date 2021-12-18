const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task')


// A Mongoose model is a wrapper on the Mongoose schema. A Mongoose schema defines the structure of 
// the document, default values, validators, etc., whereas a Mongoose model provides an interface 
// to the database for creating, querying, updating, deleting records, etc.
//
// ‘Models’ are higher-order constructors that take a schema and create an instance of a document 
// equivalent to records in a relational database.
//
// we create a schema here, instead of a model, because we are going to add some stuff to the 
// schema like the methods down below.  then we'll pass the schema to the constructor
// const User = mongoose.model('User', userSchema); down below to actually get the model to
// export
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true, // this needs to be set before the whole database gets setup or the index it needs won't be created
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens: // token list is always part of a user, it's an array of objects
    [{
        token: // token object contains a string and it's required to be there
        {
            type: String,
            required: true
        }
    }]
},
// Mongoose schemas have a timestamps option that tells Mongoose to automatically 
// manage createdAt and updatedAt properties on your documents. 
{ timestamps: true } // true to enable timestamps
// with timestampts enabled, mongoose will add these two additional fields for us
// and update them accordingly 
);

// we need to setup a virtual field on the user schema to tell mongoose
// In Mongoose, a virtual is a property that is not stored in MongoDB. 
// Virtuals are typically used for computed properties on documents.
userSchema.virtual('tasks', {
    ref: 'Task', // The ref option, which tells Mongoose which model to populate documents from.
    // The localField and foreignField options. Mongoose will populate documents from the model 
    // in ref whose foreignField matches this document's localField
    localField: '_id', // this says match to our id
    foreignField: 'owner', // this field over in Task gets populated by id's
});


// set up the middleware to run just before the user.save() function is called
// this will give us a chance to modify the data ahead of saving
userSchema.pre( 'save', // the name of the event we want to run something ahead of
                // we pass in a function here instead of an arrow function 
                // because we are going to need access to 'this' which arrow
                // functions don't have
                async function (next) {

                    const user = this; // shortcut because this is pointing to a user model
                    
                    console.log("just before saving: ", user.name);

                    // if the user has a modified password field
                    if (user.isModified('password')) {

                        user.password = await bcrypt.hash(user.password, 8);
                    }

                    next();
                }
)

// set up the middleware to run just before the user.remove() function is called
// this will give us a chance to delete any tasks or other data associated withh the user
userSchema.pre( 'remove', // the name of the event we want to run something ahead of
                // we pass in a function here instead of an arrow function 
                // because we are going to need access to 'this' which arrow
                // functions don't have, this points to the user object in this case
                async function (next) {

                    const user = this; // shortcut because this is pointing to a user model

                    results = await Task.deleteMany({owner: user._id});

                    next();
                }
)


// express automatically calls the toJSON method on an object
// that is passed into the send methods.  we'll take advantage of this
// to strip off the sensative information
userSchema.methods.toJSON = function () {
    const user = this; // for readability

    // Documents have a toObject method which converts the 
    // mongoose document into a plain JavaScript object
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}

// we are adding another function here but this one, as opposed to the statics
// collection below, is an instance method and will only be called 
// once we have a users object created, since this authentication is 
// based on a particular user, this is a regular asynch function (not arrow)
// because we need access to the "this" inside
userSchema.methods.generateAuthToken = async function () {

    const user = this; // just to make this clear

    // create a token
    // this is seralizing the object "payload" into the token
    // using the key - it'll generate a base64 payload that 
    // we can later decide into the same object
    // so that payload is an object with one key named _id
    // the value is a string representation of the user's id
    // converted into a string
    // the flip side of this is over in auth.js where we get the
    // token, decode the base64 into a string and then into an 
    // object from which we can check the id
    const token = jwt.sign(
        { _id: user._id.toString() }, // payload, can be anything but good to pick a unique value so we use the user _id
        'secretstringgoeshere'); // private key
    
    // now that we have a token, we need to add it onto the tokens array
    // I'm not sure why we are doing this yet but I think this helps allow
    // users to login on different devices and have multiple active tokens
    // at the same time
    user.tokens = user.tokens.concat({token});

    await user.save();

    return token;
}

// we are adding a function onto the userSchema model object that we can call
// usage:  
//     const user = await User.findByCredentials(req.body.email, req.body.password);
//
// I'm not sure what the value is by putting it on the model like this
// it could have been a stand alone function over in the routes
userSchema.statics.findByCredentials = async (email, password) => {
    
    // find the user by the email address
    const user = await User.findOne( {email: email} );

    if (!user) {
        console.log("didn't find user in db");
        return undefined;
    }

    // verify the password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        console.log("passwords didn't match");
        return undefined;
    }

    return user;
}

// create a user model from the schema and export that
const User = mongoose.model('User', userSchema);

module.exports = User