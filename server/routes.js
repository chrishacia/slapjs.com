const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const routes = require('./routes/index');

const router = express.Router();

const swaggerDocument = YAML.load(path.resolve(__dirname, './swagger.yaml'));

router.get('/', (req, res) => { res.sendFile(path.join(__dirname, '..', 'public', 'index.html')); });
router.get('/home', (req, res) => { res.render('home', { title: 'Home Page' }); });
router.get('/money', (req, res) => { res.render('home', { layout: 'blank', title: 'Home Page' }); });

// swagger
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

// api routes
router.use('/api/login', routes.login);
router.use('/api/register', routes.register);

module.exports = router;
