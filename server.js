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
app.delete('/recipe/:id', deleteRecipe);
app.get('/about', aboutPage);
app.get('/user', userForm);
app.post('/user', manageUser);
app.put('/substitutions', getSubstitutions);

// Catch-all
app.get('*', (req, res) => res.status(404).send('This route does not exist'));


app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// --- Helper Functions --- //

function handleError(err, res) {
  console.error(err);
  res.render('/error', (err));
}

function formatDataForRender(recipes) {
  return recipes.map((recipe) => {
    recipe.ingredientsArray = recipe.ingredients ? recipe.ingredients.split(';;') : [];
    recipe.health_labelsArray = recipe.health_labels ? recipe.health_labels.split(';;') : [];
    recipe.diet_labelsArray = recipe.diet_labels ? recipe.diet_labels.split(';;') : [];
    recipe.cal_per_serving = Math.round( parseFloat(recipe.calories / recipe.servings) * 1e2 ) / 1e2;
    recipe.identifier = recipe.recipe_name.replace(/ /g, '_');
    return recipe;
  });
}

// --- Route Handlers --- //

function userForm(req, res) {
  return res.render('pages/user');
}

function manageUser(req, res) {
  const username = req.body.username;
  const sqlSelect = 'SELECT * FROM users WHERE name=$1;';
  client.query(sqlSelect, [username])
    .then((result) => {
      if (result.rowCount > 0) {
        return res.redirect('/');
      } else {
        const sqlInsert = 'INSERT INTO users (name) VALUES ($1) RETURNING id;';
        client.query(sqlInsert, [username])
          .then((result) => {
            return res.redirect('/');
          }).catch(error => handleError(error));
      }
    }).catch(error => handleError(error));
}

function deleteRecipe(req, res) {
  const SQL = 'DELETE FROM recipes WHERE id=$1;';
  return client.query(SQL, [req.params.id])
    .then(() => {
      res.redirect('/');
    }).catch(error => handleError(error));
}

function homePage(req, res) {
  let SQL = 'SELECT * FROM recipes;'; // JOIN users ON recipes.user_id=$1;';
  return client.query(SQL)
    .then((recipes) => {
      const formattedRecipes = formatDataForRender(recipes.rows);
      res.render('pages/index', {recipes: formattedRecipes});
    }).catch(error => handleError(error));
}

function aboutPage(req,res){
  res.render('pages/about');
}

function showSearchForm(req, res) {
  res.render('pages/search/search');
}

function getOneRecipe(req, res) {
  let recipes;
  const recipeSQL = 'SELECT * FROM recipes WHERE id=$1;';
  return client.query(recipeSQL, [req.params.id])
    .then((recipeResult) => {
      recipes = formatDataForRender(recipeResult.rows);
      const substitutionsSQL = 'SELECT * FROM substitutions WHERE recipe_id=$1;';
      return client.query(substitutionsSQL, [req.params.id])
        .then((substitutions) => {
          console.log('substitutions: ', substitutions);
          return res.render('pages/one-recipe', {recipes: recipes, substitutions: substitutions.rows});
        }).catch(error => handleError(error));
    }).catch(error => handleError(error));
}

function getSubstitutions(req, res) {
  const recipe_id = req.body.recipe_id;
  const query = req.body.query;
  const addition = req.body.addition;
  let url = `https://trackapi.nutritionix.com/v2/natural/nutrients`;
  return superagent.post(url)
    .send(`{"query": "${query}"}`)
    .set({
      'x-app-id': process.env.X_APP_ID,
      'x-app-key': process.env.X_APP_KEY,
      'x-remote-user-id': 0
    })
    .set('Content-Type', 'application/json')
    .then((result) => {
      console.log('result: ', result.body.foods[0]);
      const substitution = new Substitution(result.body.foods[0], query, recipe_id, addition);
      substitution.save();
      return res.redirect(`/recipe/${recipe_id}`);
    });
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
      const formattedRecipes = formatDataForRender(recipes);
      res.render('pages/search/results', {recipes: formattedRecipes});
    }).catch(error => handleError(error));
}

function saveRecipe(req, res) {
  let SQL = 'INSERT INTO recipes (recipe_name, url, source, image_url, ingredients, servings, calories, total_fat, saturated_fat, cholesterol, sodium, total_carbohydrate, dietary_fiber, sugars, protein, potassium, health_labels, diet_labels) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING id;';

  let {recipe_name, url, source, image_url, ingredients, servings, calories, total_fat, saturated_fat, cholesterol, sodium, total_carbohydrate, dietary_fiber, sugars, protein, potassium, health_labels, diet_labels} = req.body;

  let values = [recipe_name, url, source, image_url, ingredients, servings, calories, total_fat, saturated_fat, cholesterol, sodium, total_carbohydrate, dietary_fiber, sugars, protein, potassium, health_labels, diet_labels];
  
  return client.query(SQL, values)
    .then((results) => {
      return res.redirect(`/recipe/${results.rows[0].id}`);
    }).catch(error => handleError(error));
}

// Constructors

function Recipe(info) {
  this.recipe_name = info.label;
  this.url = info.url;
  this.source = info.source;
  this.image_url = info.image;
  this.ingredients = info.ingredientLines ? info.ingredientLines.join(';;') : '';
  this.servings = info.yield;
  this.calories = info.totalNutrients.ENERC_KCAL ? Math.round( parseFloat(info.totalNutrients.ENERC_KCAL.quantity) * 1e2 ) / 1e2 : 0;
  this.total_fat = info.totalNutrients.FAT ? Math.round( parseFloat(info.totalNutrients.FAT.quantity) * 1e2 ) / 1e2 : 0;
  this.saturated_fat = info.totalNutrients.FASAT ? Math.round( parseFloat(info.totalNutrients.FASAT.quantity) * 1e2 ) / 1e2 : 0;
  this.cholesterol =
    info.totalNutrients.CHOLE ? Math.round( parseFloat(info.totalNutrients.CHOLE.quantity) * 1e2 ) / 1e2 : 0;
  this.sodium = info.totalNutrients.NA ? (Math.round( parseFloat(info.totalNutrients.NA.quantity) * 1e2 ) / 1e2) : 0;
  this.total_carbohydrate = info.totalNutrients.CHOCDF ? (Math.round( parseFloat(info.totalNutrients.CHOCDF.quantity) * 1e2 ) / 1e2) : 0;
  this.dietary_fiber = info.totalNutrients.FIBTG ? (Math.round( parseFloat(info.totalNutrients.FIBTG.quantity) * 1e2 ) / 1e2) : 0;
  this.sugars = info.totalNutrients.SUGAR ? (Math.round( parseFloat(info.totalNutrients.SUGAR.quantity) * 1e2 ) / 1e2) : 0;
  this.protein = info.totalNutrients.PROCNT ? (Math.round( parseFloat(info.totalNutrients.PROCNT.quantity) * 1e2 ) / 1e2) : 0;
  this.potassium = info.totalNutrients.K ? (Math.round( parseFloat(info.totalNutrients.K.quantity) * 1e2 ) / 1e2) : 0;
  this.health_labels = info.healthLabels ? info.healthLabels.join(';;') : '';
  this.diet_labels = info.dietLabels ? info.dietLabels.join(';;') : '';
}

function Substitution(info, query, recipe_id, addition) {
  this.ingredients = query;
  this.addition = addition === 'true' ? true : false;
  this.calories = info.nf_calories ? info.nf_calories : 0;
  this.total_fat = info.nf_total_fat ? info.nf_total_fat : 0;
  this.saturated_fat = info.nf_saturated_fat ? info.nf_saturated_fat : 0;
  this.cholesterol = info.nf_cholesterol ? info.nf_cholesterol : 0;
  this.sodium = info.nf_sodium ? info.nf_sodium : 0;
  this.total_carbohydrate = info.nf_total_carbohydrate ? info.nf_total_carbohydrate : 0;
  this.dietary_fiber = info.nf_dietary_fiber ? info.nf_dietary_fiber : 0;
  this.sugars = info.nf_sugars ? info.nf_sugars : 0;
  this.protein = info.nf_protein ? info.nf_protein : 0;
  this.potassium = info.nf_potassium ? info.nf_potassium : 0;
  this.recipe_id = recipe_id;
}

Substitution.prototype.save = function() {
  const SQL = `INSERT INTO substitutions (
    ingredient, 
    addition, 
    calories, 
    total_fat, 
    saturated_fat, 
    cholesterol, 
    sodium, 
    total_carbohydrate, 
    dietary_fiber, 
    sugars, 
    protein, 
    potassium, 
    recipe_id
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);`;

  const values = Object.values(this);
  client.query(SQL, values);
}
