'use strict';

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended: true}));

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(
  methodOverride(req => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

app.get('/', homePage);

app.get('*', createErrorMiddleware('Page not found'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// --- Helper Functions --- //

function createErrorMiddleware(error) {
  return function(req, res) {
    res.render('pages/error', {error});
  }
}

function homePage(req, res) {
  res.render('pages/index');
}
