const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const compression = require('compression');

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
router.use('/api/login', require('./login'));
router.use('/api/domain-list', require('./domain-list'));
router.use('/api/message', require('./messages'));

app.use(router);


// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, '/dist')));

// Handle all GET requests
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '/dist/index.html'));
});


app.listen(PORT, () => {
  if (process.env.SERVER_ENV !== 'production') {
    console.log(`Server running in ${PORT} mode`);
  }
});