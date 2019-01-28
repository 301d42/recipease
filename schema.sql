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
  image_url VARCHAR(255),
  ingredients VARCHAR(2550),
  servings INTEGER,
	calories NUMERIC(5, 2),
	total_fat NUMERIC(5, 2),
	saturated_fat NUMERIC(5, 2),
	cholesterol NUMERIC(5, 2),
	sodium NUMERIC(5, 2),
	total_carbohydrate NUMERIC(5, 2),
	dietary_fiber NUMERIC(5, 2),
	sugars NUMERIC(5, 2),
	protein NUMERIC(5, 2),
	potassium NUMERIC(5, 2),
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE substitutions (
  id SERIAL PRIMARY KEY,
  ingredient VARCHAR(255),
	calories NUMERIC(5, 2),
	total_fat NUMERIC(5, 2),
	saturated_fat NUMERIC(5, 2),
	cholesterol NUMERIC(5, 2),
	sodium NUMERIC(5, 2),
	total_carbohydrate NUMERIC(5, 2),
	dietary_fiber NUMERIC(5, 2),
	sugars NUMERIC(5, 2),
	protein NUMERIC(5, 2),
	potassium NUMERIC(5, 2),
  recipe_id INTEGER NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes (id)
);
