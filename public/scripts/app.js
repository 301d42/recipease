'use strict';

$('.details-button').on('click', function() {
  const recipe_name = $(this).data('recipe_name');
  $(this).siblings(`.${recipe_name}`).toggleClass('hide');
});
