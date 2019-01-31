'use strict';

$('.details-button').on('click', function() {
  const recipe_name = $(this).data('recipe_name');
  const button = $(this);
  console.log(recipe_name);
  button.siblings(`.${recipe_name}`).toggleClass('hide');
  button.text(button.text() === 'Hide Details' ? 'Show Details' : 'Hide Details');
});
