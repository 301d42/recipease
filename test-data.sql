
INSERT INTO users (
	name
) VALUES (
	'Blary Fnorgin'
);

INSERT INTO recipes (
	recipe_name, 
	url, 
	source, 
	image_url, 
	servings, 
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
	user_id) VALUES (
		'Chicken Vesuvio',
		'http://www.seriouseats.com/recipes/2011/12/chicken-vesuvio-recipe.html',
		'Serious Eats',
		'https://www.edamam.com/web-img/e42/e42f9119813e890af34c259785ae1cfb.jpg',
		4,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		1
	);

INSERT INTO ingredients (
	recipe_id,
	ingredient
) VALUES (
	1,
	'1/2 cup olive oil'
);

INSERT INTO ingredients (
	recipe_id,
	ingredient
) VALUES (
	1,
	'5 cloves garlic, peeled'
);

INSERT INTO ingredients (
	recipe_id,
	ingredient
) VALUES (
	1,
	'2 large russet potatoes, peeled and cut into chunks'
);

INSERT INTO ingredients (
	recipe_id,
	ingredient
) VALUES (
	1,
	'1 3-4 pound chicken, cut into 8 pieces (or 3 pound chicken legs)'
);

INSERT INTO ingredients (
	recipe_id,
	ingredient
) VALUES (
	1,
	'3/4 cup white wine'
);
