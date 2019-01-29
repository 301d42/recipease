'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

// Load Enviroment from .env file
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Application Middleware
app.use(express.urlencoded({extended: true}));

// Database setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');
app.use(express.static('./public'));

//Middleware for Update and Delete
app.use(
  methodOverride(req => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

// API Routes
// Renders the search form
// app.get('/', homePage);

app.get('/search', searchRecipes);

// Catch-all
app.get('*', createErrorMiddleware('Page not found'));


app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// --- Helper Functions --- //

function createErrorMiddleware(error) {
  return function(req, res) {
    res.render('pages/error', {error});
  }
}

function handleError(err, res) {
  console.error(err);
  res.render('pages/error', (err));
}

function homePage(req, res) {
  res.render('pages/index');
}

function searchRecipes(req, res) {
  console.log('Inside searchRecipes.');
  let url = `https://api.edamam.com/search?app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_API_KEY}&q=${req.query.q}`;


  return superagent.get(url)
    .then(response => {
      // console.log('Response: ', response.body);
      // console.log('Req.body: ', req);
      return response.body.hits.map((valItem) => {
        return new Recipe(valItem.recipe);
      })
    })
    .then(recipeInstances => {
      console.log('Recipe instances: ', recipeInstances[0]);
    })
    .catch(error => handleError(error));

}

// Constructor
function Recipe(info) {
  this.recipe_name = info.label;
  this.url = info.url;
  this.image_url = info.image;
  this.ingredients = info.ingredientLines.join('');
  this.servings = info.yield;
  this.calories = Math.round( parseFloat(info.totalNutrients.ENERC_KCAL.quantity) * 1e2 ) / 1e2;
  this.total_fat = Math.round( parseFloat(info.totalNutrients.FAT.quantity) * 1e2 ) / 1e2;
  this.saturated_fat = Math.round( parseFloat(info.totalNutrients.FASAT.quantity) * 1e2 ) / 1e2;
  this.cholesterol =
    info.totalNutrients.CHOLE ? Math.round( parseFloat(info.totalNutrients.CHOLE.quantity) * 1e2 ) / 1e2 : 0;
  this.sodium = Math.round( parseFloat(info.totalNutrients.NA.quantity) * 1e2 ) / 1e2;
  this.total_carbohydrate = Math.round( parseFloat(info.totalNutrients.CHOCDF.quantity) * 1e2 ) / 1e2;
  this.dietary_fiber = Math.round( parseFloat(info.totalNutrients.FIBTG.quantity) * 1e2 ) / 1e2;
  this.sugars = Math.round( parseFloat(info.totalNutrients.SUGAR.quantity) * 1e2 ) / 1e2;
  this.protein = Math.round( parseFloat(info.totalNutrients.PROCNT.quantity) * 1e2 ) / 1e2;
  this.potassium = Math.round( parseFloat(info.totalNutrients.K.quantity) * 1e2 ) / 1e2;
  this.health_labels = info.dietLabels.join(',')+info.healthLabels.join(',')+info.cautions.join(',');
}

