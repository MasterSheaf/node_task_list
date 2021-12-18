const mongoose = require('mongoose')
const validator = require('validator')

// You can think of a Mongoose schema as the 
// configuration object for a Mongoose model. 
// A SchemaType is then a configuration object 
// for an individual property.

// when we pass this obhect in as the second parameter here 
// mongoose behind the scenes creates a Schema for us
// if we want to do anything fancy like middlware or adding
// static methods we need to create the Schema and then 
// pass that Schema into a constructor later on to get the
// actual model

const taskSchema = mongoose.Schema( {
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        // we can put any type we want here as the type type
        // mongoose provides a special type ObjectID that is 
        // the magic type that it uses internally to associate
        // two documents across collections
        type: mongoose.Schema.Types.ObjectId,
        required: true, // we cannot create an annonymous task any longer
        ref: 'User' // create the relationship to the other model we want to know about
        // After linking other collections in your schema using the appropriate 
        // type and ref, your actual stored data for that property will be another 
        // document’s _id. It will be stored as a string.
        // So here, the owner property is actually will be an object id
        // pointing to a document in another collection 
        //
        // Keep in mind that this is your stored document. 
        // We have not called .populate() on it yet.
        // Once it is called, it will go to the appropriate collection, search for
        // the id we have here in the owner field and return the Task
        // but this time the owner will be swapped out for the actual owner
        // object from the other collection
    }
},
    { timestamps: true } // see the user model for some notes
)

// The properties that we want to use .populate() on are properties that have a type 
// of mongoose.Schema.Types.ObjectId. This tells Mongoose “Hey, I’m gonna be referencing 
// other documents from other collections from this model”. The next part of that property is the ref. 
// The ref tells Mongoose “Those docs I want to reference are going to be in the 'XXX' collection.”

// references:  https://medium.com/@nicknauert/mongooses-model-populate-b844ae6d1ee7
// https://www.geeksforgeeks.org/mongoose-populate-method/

// create a user model from the schema and export that
const Task = mongoose.model('Task', taskSchema);

module.exports = Task