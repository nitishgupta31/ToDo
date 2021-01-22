const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8000;
const mongoose = require("mongoose")

//connecting with mongodb named todo
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true, 'useFindAndModify': false, 'useCreateIndex': true })
    .then(() => console.log("connection succesfull"))
    .catch(() => console.log("error in connecting database"));

//creating a schema in todo database
const todoSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    }
});

//making model of schema and colection will automatically named plural of todo i.e. todos
const todo = mongoose.model('todo', todoSchema);

const showDocument = async () => {
    try {
        const collections = await todo.find({}, { content: 1 })  //returning BSON 
        object = { "c": collections }
        if (collections[0] == undefined) {
            object = { "data": collections, "message": "Nothing to show!" }

        }
        else {
            object = { "data": collections, "message": "Your Todos" }
        }
    } catch (error) {
        console.log(error)
    }

}
showDocument();

// EXPRESS SPECIFIC STUFF
app.use('/static', express.static('static')) // For serving static files 
app.use(express.urlencoded({ extended: true })) //To extract the data from the website to the app.js file

// PUG SPECIFIC STUFF
app.set('view engine', 'pug') // Set the template engine as pug
app.set('views', path.join(__dirname, 'views')) // Set the views directory

// ENDPOINTS
app.get('/', async (req, res) => {
    await showDocument();
    res.status(200).render('index.pug', object);
})

app.post('/', async (req, res) => {
    const createDocument = async () => {
        try {
            var myData = new todo(req.body);
            const result = await myData.save()
            //console.log(result)

        } catch (error) {
            console.log(error)
        }
    }
    await createDocument();

    await showDocument();


    res.status(200).render('index.pug', object);

})


app.get('/todos/:_id', function (req, res) {
    todo.findByIdAndDelete(req.params, function (err, results) {
        if (err) {
            return res.send(500, err);
        }
        else {
            res.redirect('/');
        }
    });

});


// edit
app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    todo.find({}, (err, tasks) => {
        res.render("edit.pug", {
            data: tasks, idTask: id, message: "Your Todos"
        });
    });
})

app.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    todo.findByIdAndUpdate(id, {
        content: req.body.content
    }, err => {
        if (err) return res.send(500, err);
        res.redirect("/");
    });
});


// START THE SERVER
app.listen(port, () => {
    console.log(`The application started successfully on port ${port}`);
});
