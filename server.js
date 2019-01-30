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

// Routes
app.get('/', homePage);
app.get('/search', showSearchForm);
app.post('/results', searchRecipes);
app.post('/recipe', saveRecipe);
app.get('/recipe/:id', getOneRecipe);

// Catch-all
app.get('*', (req, res) => res.status(404).send('This route does not exist'));


app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// --- Helper Functions --- //

function handleError(err, res) {
  console.error(err);
  res.render('/error', (err));
}

function homePage(req, res) {
  let SQL = 'SELECT * FROM recipes;'; // JOIN users ON recipes.user_id=$1;';
  return client.query(SQL)
    .then((recipes) => {
      res.render('pages/index', {recipes: recipes.rows});
    }).catch(error => handleError(error));
}

function showSearchForm(req, res) {
  res.render('pages/search/search');
}

function getOneRecipe(req, res) {
  let recipe, substitutions;
  let SQL = 'SELECT * FROM recipes WHERE id=$1;';
  return client.query(SQL, [req.params.id])
    .then((recipeResult) => {
      recipe = recipeResult;
      let SQL = 'SELECT * FROM substitutions WHERE recipe_id=$1;';
      return client.query(SQL, [req.params.id]);
    })
    .then((substitutionResult) => {
      substitutions = substitutionResult;
      return res.render('/', {recipe, substitutions});
    }).catch(error => handleError(error));
}

function searchRecipes(req, res) {
  let url = `https://api.edamam.com/search?app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_API_KEY}&q=${req.body.keyword}`;

  if (req.body.balanced === 'on') url += '&diet=balanced';
  if (req.body.high_protein === 'on') url += '&diet=high-protein';
  if (req.body.low_carb === 'on') url += '&diet=low-carb';
  if (req.body.low_fat === 'on') url += '&diet=low-fat';
  if (req.body.alchohol_free === 'on') url += '&health=alchohol-free';
  if (req.body.vegan === 'on') url += '&health=vegan';
  if (req.body.vegetarian === 'on') url += '&health=vegetarian';
  if (req.body.sugar_conscious === 'on') url += '&health=sugar-conscious';
  if (req.body.peanut_free === 'on') url += '&health=peanut-free';
  if (req.body.calories > 0) url += `&calories=${req.body.calories}`;

  return superagent.get(url)
    .then(response => {
      return response.body.hits.map((valItem) => {
        return new Recipe(valItem.recipe);
      });
    })
    .then(recipes => {
      res.render('pages/search/results', {recipes});
      console.log(recipes);
    }).catch(error => handleError(error));
}

function saveRecipe(req, res) {
  let SQL = 'INSERT INTO recipes (recipe_name, url, source, image_url, servings, calories, total_fat, saturated_fat, cholesterol, sodium, total_carbohydrate, dietary_fiber, sugars, protein, potassium,  user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id;';
  let {recipe_name, url, source, image_url, ingredients, servings, calories, total_fat, saturated_fat, cholesterol, sodium, total_carbohydrate, dietary_fiber, sugars, protein, potassium,health_labels, diet_labels, user_id} = req.body;
  let values = [recipe_name, url, source, image_url, servings, calories, total_fat, saturated_fat, cholesterol, sodium, total_carbohydrate, dietary_fiber, sugars, protein, potassium, user_id];
  return client.query(SQL, values)
    .then(mainId=> {  //mainId--id(in recipes table FK in other tables)
      console.log('ln 118 Recipie ID return, FK other TABLES:', mainId);
      ingredients.forEach(ingredient =>{
        let SQL = 'INSERT INTO ingredients (recipe_id,ingredient) VALUES ($1,$2) RETURNING recipe_id;';
        let values = [mainId, ingredient];
        return client.query(SQL, values)
      })

      health_labels.forEach(health =>{
        let SQL = 'INSERT INTO healths (recipe_id,health_label) VALUES ($1,$2) RETURNING recipe_id;';
        let values = [mainId, health];
        return client.query(SQL,values)
      })

      diet_labels.forEach(diet =>{
        let SQL = 'INSERT INTO dietss (recipe_id,diet) VALUES ($1,$2) RETURNING recipe_id;';
        let values = [mainId, diet];
        return client.query(SQL, values)
      })
      // ************************   redirect not finished.
      return res.render(`/recipe/`)
    })
    .catch(error => handleError(error));
}

// Constructors

function Recipe(info) {
  this.recipe_name = info.label;
  this.url = info.url;
  this.source = info.source;
  this.image_url = info.image;
  this.ingredients = info.ingredientLines ? info.ingredientLines : [];
  this.servings = info.yield;
  this.calories = Math.round( parseFloat(info.totalNutrients.ENERC_KCAL.quantity) * 1e2 ) / 1e2;
  this.total_fat = Math.round( parseFloat(info.totalNutrients.FAT.quantity) * 1e2 ) / 1e2;
  this.saturated_fat = Math.round( parseFloat(info.totalNutrients.FASAT.quantity) * 1e2 ) / 1e2;
  this.cholesterol =
    info.totalNutrients.CHOLE ? Math.round( parseFloat(info.totalNutrients.CHOLE.quantity) * 1e2 ) / 1e2 : 0;
  this.sodium = info.totalNutrients.NA ? (Math.round( parseFloat(info.totalNutrients.NA.quantity) * 1e2 ) / 1e2) : 0;
  this.total_carbohydrate = info.totalNutrients.CHOCDF ? (Math.round( parseFloat(info.totalNutrients.CHOCDF.quantity) * 1e2 ) / 1e2) : 0;
  this.dietary_fiber = info.totalNutrients.FIBTG ? (Math.round( parseFloat(info.totalNutrients.FIBTG.quantity) * 1e2 ) / 1e2) : 0;
  this.sugars = info.totalNutrients.SUGAR ? (Math.round( parseFloat(info.totalNutrients.SUGAR.quantity) * 1e2 ) / 1e2) : 0;
  this.protein = info.totalNutrients.PROCNT ? (Math.round( parseFloat(info.totalNutrients.PROCNT.quantity) * 1e2 ) / 1e2) : 0;
  this.potassium = info.totalNutrients.K ? (Math.round( parseFloat(info.totalNutrients.K.quantity) * 1e2 ) / 1e2) : 0;
  this.health_labels = info.healthLabels ? info.healthLabels : [];
  this.diet_labels = info.dietLabels ? info.dietLabels : [];
}

