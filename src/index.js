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

const Task = require('./models/task')
const User = require('./models/user')

const queryParams = {
    completedFilter: "false"
}

const query = {
    owner: '61be5b7afabc13afb9fe17d9'
    ,   ...( ('completedFilter' in queryParams) && {completed: queryParams.completedFilter})
};

const main = async () => {

    const docs = await Task.find(query);

    docs.forEach( (task) => {
        console.log("Task: ", task.id, task.description, task.completed);
    })

}

main()

// // make an async function so we can use await inside
// const main = async () => {
//     // const task = await Task.findById('61ba986fe05e33f24ac1b1a2')
//     // task.populate('owner')
//     // .then( (task) => {
//     //     console.log( JSON.stringify(task.owner) )
//     //     console.log( task.owner.id )
//     //     console.log( task.owner.name )
//     // })
//     // .catch( (e) => {
//     //     console.log('Exception', e)
//     // })
//     const user = await User.findById('61ba8468f0149d17aa369ac1')
//     await user.populate('tasks') // populate that virtual field we created on user
    
//     user.tasks.forEach( (task) => {
//         console.log("Task\n", task.id, task.description, task.completed);
//     })
    
// }



// // Goofing around with json web tokens
// const jwt = require('jsonwebtoken');

// const myfunc = async () => {
//     const secret = 'thisismyrandomseriesofcharaters';

//     const token = jwt.sign({ _id:'abc123' }, secret, {expiresIn: '5 seconds'});
//     console.log(token);

//     setTimeout(()=>{

//         try {
//             const data = jwt.verify(token, secret);
//             console.log(data);
//         }catch (e) {
//             console.log(e);
//         }
//     },300);

// }

// myfunc();