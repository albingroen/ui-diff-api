const app = require('express')()
const cors = require('cors')
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
require('dotenv').config()
require("./db");

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/login', require('./routes/login'))
app.use('/auth', require('./routes/auth'))
app.use('/users', require('./routes/user'))

app.listen(5000, () => console.log(`Running on port ${port} 🎉`))