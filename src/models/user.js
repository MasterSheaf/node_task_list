const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    }
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

const User = mongoose.model('User', userSchema);

module.exports = User