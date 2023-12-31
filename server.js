const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const compression = require('compression');
const { engine } = require('express-handlebars');
const routes = require('./server/routes');

dotenv.config();
const app = express();

const PORT = process.env.SERVER_PORT;

// CORS whitelist
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

// Express configuration
app.engine('hbs', engine({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'server/views/layouts'),
  partialsDir: path.join(__dirname, 'server/views/partials'),
}));
app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', '.hbs');

app.use(compression());
app.use(cors(corsOptionsDelegate));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/css', express.static(`${__dirname}/node_modules/bootstrap/dist/css`));
app.use('/css', express.static(`${__dirname}/node_modules/@fortawesome/fontawesome-free/css`));
app.use('/css', express.static(`${__dirname}/shared/styles`));
app.use('/js', express.static(`${__dirname}/node_modules/bootstrap/dist/js`));
app.use('/js', express.static(`${__dirname}/node_modules/@fortawesome/fontawesome-free/js`));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

// Routes
app.use(routes);

app.listen(PORT, () => {
  if (process.env.SERVER_ENV !== 'production') {
    console.log(`Server running in ${PORT} mode`);
  }
});

// hashPassword('password')
//             .then((saltAndHash) => {
//               login.createLogin({
//                 create_ts: getUtcDateTime(),
//                 email: 'chris@hacia.net',
//                 pass: saltAndHash[1],
//                 salt: saltAndHash[0],
//               }).then(() => {

//               })
//           });
