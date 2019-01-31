# final_project: Recipease

**Authors**: Tim Schoen, Milo Anderson, Chris Ball, Jasmin Arensdorf

**Version**: 1.0.0 

## Overview

This app uses the edamam.com API to give users a single location from which they can search for recipes from multiple sources around the Web. Users can view detailed nutrition information for each recipe, and save all information to a database so they can refer to their recipes later. 
 
## **User-Stories**

#### MVP

- As a user I would like a web app that I can search for a recipe and get a recipe based on ingredients.

- As a user I would like to select a recipe so that I can see nutritional data.

- As a user I would like to add or remove recipes from my saved-recipe collection.

#### Stretch Goals

- As a user I would like to add or remove ingredients from a recipe in order to customize the recipe.

- As a user I would like the ability to make changes to a recipe and have correct nutritional information displayed.  

## Getting Started

After you clone the repo, you will need to run "npm install" in your terminal to install the required dependencies. 

Create a postgres database and add the connection information as DATABASE_URL in your environment variables. You'll also want to and add a PORT number, e.g. "PORT=3000".

After the database is created, run the included schema.sql file to create the tables: psql -d [database_name] -f schema.sql

## Architecture
<!-- Provide a detailed description of the application design. What technologies (languages, libraries, etc) you're using, and any other relevant design information. -->

The app uses express to provide server routing/callback functionality; superagent to return API data; pg to manage database connections & queries; and method-override to manage put/delete HTTP requests. Web pages are rendered with ejs

## Change Log
<!-- Use this area to document the iterative changes made to your application as each feature is successfully implemented. Use time stamps. Here's an examples:

01-01-2001 4:59pm - Application now has a fully-functional express server, with a GET route for the location resource.-->

01-30-2019 4:00pm - Application has working recipe search & uses Create, Read, and Delete HTTP methods

## Credits and Collaborations
