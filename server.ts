import path from 'path';

import bodyParser from 'body-parser';
import compression from 'compression';
import cors, { CorsOptions, CorsOptionsDelegate } from 'cors';
import dotenv from 'dotenv';
import express, { Request, Express } from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';

import routes from './server/routes'; // Ensure this is the correct path

dotenv.config();
const app: Express = express();

const PORT = process.env.SERVER_PORT;

const whitelist = (process.env.SERVER_WHITELIST ?? '').split(',');
const domainExistsOnWhitelist = (req: Request) => whitelist.indexOf(req.header('Origin') as string) !== -1;

// enable CORS
const corsOptionsDelegate: CorsOptionsDelegate<Request> = (req: Request, callback: (err: Error | null, options?: CorsOptions) => void) => {
    let corsOptions: CorsOptions;
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
  secret: process.env.SERVER_SESSION_SECRET!,
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
app.use(routes); // Ensure routes is a valid middleware function

app.listen(PORT, () => {
  if (process.env.SERVER_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT}`);
  }
});
