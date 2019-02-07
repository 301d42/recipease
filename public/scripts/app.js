'use strict';

$(function() {
  $('.details-button').on('click', function() {
    const button = $(this);
    const recipe_name = button.data('recipe_name');
    button.siblings(`.${recipe_name}`).toggleClass('hide');
    button.parent().siblings('ul').toggleClass('flex-one');
    button.parent().toggleClass('flex-one');
  });

  $('.save-button').on('click', function(event) {
    event.preventDefault();
    const button = $(this);
    button.addClass('saved');
    button.text('Saved!');
    const data = {
      ajax: true,
      recipe_name: button.siblings('input[name="recipe_name"]').val(),
      url: button.siblings('input[name="url"]').val(),
      source: button.siblings('input[name="source"]').val(),
      image_url: button.siblings('input[name="image_url"]').val(),
      ingredients: button.siblings('input[name="ingredients"]').val(),
      servings: button.siblings('input[name="servings"]').val(),
      calories: button.siblings('input[name="calories"]').val(),
      total_fat: button.siblings('input[name="total_fat"]').val(),
      saturated_fat: button.siblings('input[name="saturated_fat"]').val(),
      cholesterol: button.siblings('input[name="cholesterol"]').val(),
      sodium: button.siblings('input[name="sodium"]').val(),
      total_carbohydrate: button.siblings('input[name="total_carbohydrate"]').val(),
      dietary_fiber: button.siblings('input[name="dietary_fiber"]').val(),
      sugars: button.siblings('input[name="sugars"]').val(),
      protein: button.siblings('input[name="protein"]').val(),
      potassium: button.siblings('input[name="potassium"]').val(),
      health_labels: button.siblings('input[name="health_labels"]').val(),
      diet_labels: button.siblings('input[name="diet_labels"]').val()
    };
    $.ajax({
      type: 'POST',
      url: '/recipe',
      data: data
    });
  });

  $('.search-labels > label').on('click', function() {
    const checkbox = $(this);
    checkbox.toggleClass('selected');
    checkbox.children('input').prop('checked') === true ? checkbox.children('input').prop('checked', false) : checkbox.children('input').prop('checked', true);
    return false;
  });
});
