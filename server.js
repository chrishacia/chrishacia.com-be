const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const compression = require('compression');
const login = require('./login');
const domainList = require('./domain-list');

dotenv.config();
const app = express();

const PORT = process.env.SERVER_PORT;

const whitelist = process.env.SERVER_WHITELIST.split(',');
const domainExistsOnWhitelist = (req) => whitelist.indexOf(req.header('Origin')) !== -1;

// enable CORS
const corsOptionsDelegate = (req, callback) => {
  let corsOptions;
  if (domainExistsOnWhitelist(req)) {
    // Enable CORS for this request
    corsOptions = { origin: true };
  } else {
    // Disable CORS for this request
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

app.use(compression());
app.use(cors(corsOptionsDelegate));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = express.Router();
router.use('/api/login', login);
router.use('/api/domain-list', domainList);

app.use(router);

app.listen(PORT, () => {
  if (process.env.SERVER_ENV !== 'production') {
    console.log(`Server running in ${PORT} mode`);
  }
});