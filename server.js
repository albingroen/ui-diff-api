const app = require('express')()
const cors = require('cors')
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/auth', require('./routes/auth'))

app.listen(5000, () => console.log(`Running on port ${port} 🎉`))