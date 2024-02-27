// Connect to env
require("dotenv").config();

// Connect to ExpressJS
const express = require('express');
const app = express();
const port = process.env.PORT;

// Connect to mongoose DB
const database = require("./config/database")
database.connect();

// Connect to routes
const route = require('./routes/client/index.route')
route(app);

// Connect to pug
app.set('views', './views');
app.set('view engine', 'pug');

// Configuration public file
app.use(express.static("public"));


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

