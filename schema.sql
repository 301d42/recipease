DROP TABLE IF EXISTS substitutions;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255)
);

CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  recipe_name VARCHAR(255),
	ingredients TEXT,
	url VARCHAR(255),
	source VARCHAR(255),
  image_url VARCHAR(255),
  servings INTEGER,
	calories INTEGER,
	total_fat INTEGER,
	saturated_fat INTEGER,
	cholesterol INTEGER,
	sodium INTEGER,
	total_carbohydrate INTEGER,
	dietary_fiber INTEGER,
	sugars INTEGER,
	protein INTEGER,
	potassium INTEGER,
	health_labels VARCHAR(255),
	diet_labels VARCHAR(255)
);

CREATE TABLE substitutions (
  id SERIAL PRIMARY KEY,
  ingredient VARCHAR(255),
	addition BOOLEAN,
	calories INTEGER,
	total_fat INTEGER,
	saturated_fat INTEGER,
	cholesterol INTEGER,
	sodium INTEGER,
	total_carbohydrate INTEGER,
	dietary_fiber INTEGER,
	sugars INTEGER,
	protein INTEGER,
	potassium INTEGER,
  recipe_id INTEGER NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
