const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const routes = require('./server/routes');
import { Request, Express } from 'express';
import Cors from 'cors';

dotenv.config();
const app: Express = express();

const PORT = process.env.SERVER_PORT;

const whitelist = (process.env.SERVER_WHITELIST ?? '').split(',');
const domainExistsOnWhitelist = (req: Request) => whitelist.indexOf(req.header('Origin') as string) !== -1;

// enable CORS
const corsOptionsDelegate = (req: Request, callback: (error: any, options: Cors.CorsOptions) => void) => {
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

app.use(bodyParser.json());

app.use(session({
  secret: process.env.SERVER_SESSION_SECRET,
  resave: false,
  rolling: true,
  saveUninitialized: true,
  cookie: { secure: process.env.SERVER_ENV === 'production', maxAge: 3600000 * 24 * 3 },
}));

app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', '.hbs');

app.use(compression());
app.use(cors(corsOptionsDelegate));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/img', express.static(`${__dirname}/shared/images`));
app.use('/css', express.static(`${__dirname}/node_modules/bootstrap/dist/css`));
app.use('/css', express.static(`${__dirname}/node_modules/bootstrap-icons/font/fonts`));
app.use('/css', express.static(`${__dirname}/node_modules/@fortawesome/fontawesome-free/css`));
app.use('/css', express.static(`${__dirname}/shared/styles`));
app.use('/dist', express.static(`${__dirname}/public/dist`));
app.use('/js', express.static(`${__dirname}/node_modules/bootstrap/dist/js`));
app.use('/js', express.static(`${__dirname}/node_modules/@fortawesome/fontawesome-free/js`));

app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

// Routes
app.use(routes);

app.listen(PORT, () => {
  if (process.env.SERVER_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(`Server running in ${PORT} mode`);
  }
});
