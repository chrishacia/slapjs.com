import path from 'path';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response, Express } from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';
import routes from './server/routes';
import { globalRateLimiter } from './server/rateLimit';
import {
    PORT,
    MAX_AGE_IN_MS,
    SESSION_SECRET,
    VIEWS_PATH,
    STATIC_PATH,
    IS_PRODUCTION
} from './server/constants';

dotenv.config();
const app: Express = express();

// Express configuration
app.engine('hbs', engine({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(VIEWS_PATH, 'layouts'),
  partialsDir: path.join(VIEWS_PATH, 'partials'),
}));

app.use(bodyParser.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  rolling: true,
  saveUninitialized: true,
  cookie: { secure: IS_PRODUCTION, maxAge: MAX_AGE_IN_MS },
}));

app.set('views', VIEWS_PATH);
app.set('view engine', '.hbs');

app.use(compression());
app.use(cors({
  origin: '*'
}));

app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to all requests
app.use(globalRateLimiter);


// Static files
app.use('/img', express.static(path.join(__dirname, 'shared/images')));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap-icons/font/fonts')));
app.use('/css', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/css')));
app.use('/css', express.static(path.join(__dirname, 'shared/styles')));
app.use('/dist', express.static(path.join(__dirname, 'public/dist')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/js')));

app.use('/', express.static(STATIC_PATH, { maxAge: 31557600000 }));

// Routes
app.use(routes);

app.listen(PORT, () => {
  if (!IS_PRODUCTION) {
    console.log(`Server running on port http://localhost:${PORT}`);
  }
});
