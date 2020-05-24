/* eslint-disable no-console */
const app = require('express')();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const { envs, env } = require('./lib/env');

const port = process.env.PORT || 5000;
require('dotenv').config();
require('./db');

const whitelist = [envs.local, envs.live];

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    console.log({
      origin,
    });
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }));
app.use(bodyParser.json({ limit: '500mb', extended: true }));

app.use((req, res, next) => {
  res.header('Content-Type', 'application/json;charset=UTF-8');
  res.header('Access-Control-Allow-Credentials', true);
  res.header(
    'Access-Control-Allow-Headers',
    'X-Requested-With, Content-Type, Accept',
  );
  res.header(
    'Access-Control-Allow-Origin',
    env === 'live' ? envs.live : envs.local,
  );
  next();
});

app.use(cors(corsOptions));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Server',
    status: 200,
  });
});

app.use('/login', require('./routes/login'));
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/user'));
app.use('/projects', require('./routes/project'));
app.use('/teams', require('./routes/team'));
app.use('/invitations', require('./routes/invitation'));

app.get('/test', (req, res) => {
  res.cookie('hello', 'world');
  res.json('cool');
});

app.get('/download', (req, res) => {
  const { file } = req.query;

  if (!file) {
    res.status(400);
    return;
  }

  const script = `${__dirname}/script.js.txt`;
  const pages = `${__dirname}/pages.js.txt`;
  const config = `${__dirname}/config.js.txt`;

  const filesToDownload = { script, pages, config };

  res.download(filesToDownload[file]);
});

app.listen(port, () => console.log(`Running on port ${port} 🎉`));
