// express is actually a function, not an object
const express = require('express');

// we need to run the database stuff so we require it which runs 
// the script, we don't return or export anything to set though
require('./db/database');

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express();

app.use(userRouter);
app.use(taskRouter);

// if there is an environment variable called PORT we'll use it
// if not then we'll default to 3000 - since we plan on deploying this
// to Heroku we'll have that environment variable there so we are ready
const port = process.env.PORT || 3000;

app.get('*', (req, res) => {
    res.send('Page not found!');
});

app.listen(port, () => {
    console.log("Server Running on Port 3000");
});
