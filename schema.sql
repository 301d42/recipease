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
	url VARCHAR(255),
	source VARCHAR(255),
  image_url VARCHAR(255),
  ingredients TEXT[],
  servings INTEGER,
	calories NUMERIC(6, 2),
	total_fat NUMERIC(6, 2),
	saturated_fat NUMERIC(6, 2),
	cholesterol NUMERIC(6, 2),
	sodium NUMERIC(6, 2),
	total_carbohydrate NUMERIC(6, 2),
	dietary_fiber NUMERIC(6, 2),
	sugars NUMERIC(6, 2),
	protein NUMERIC(6, 2),
	potassium NUMERIC(6, 2),
	health_labels TEXT[],
	diet_labels TEXT[],
	cautions TEXT[],
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

/* CREATE TABLE ingredients (
	id SERIAL PRIMARY KEY,
	ingredient VARCHAR(255),
	recipe_id INTEGER NOT NULL,
	FOREIGN KEY (recipe_id) REFERENCES recipes(id)
); */

CREATE TABLE substitutions (
  id SERIAL PRIMARY KEY,
  ingredient VARCHAR(255),
	addition BOOLEAN,
	calories NUMERIC(6, 2),
	total_fat NUMERIC(6, 2),
	saturated_fat NUMERIC(6, 2),
	cholesterol NUMERIC(6, 2),
	sodium NUMERIC(6, 2),
	total_carbohydrate NUMERIC(6, 2),
	dietary_fiber NUMERIC(6, 2),
	sugars NUMERIC(6, 2),
	protein NUMERIC(6, 2),
	potassium NUMERIC(6, 2),
  recipe_id INTEGER NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);
