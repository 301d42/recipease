'use strict';

$(function() {
  $('.details-button').on('click', function() {
    const button = $(this);
    const recipe_name = button.data('recipe_name');
    console.log('recipe_name: ', recipe_name);
    button.siblings(`.${recipe_name}`).toggleClass('hide');
    //button.text(button.text() === 'Hide Details' ? 'Show Details' : 'Hide Details');
    button.parent().siblings('ul').toggleClass('flex-one');
    button.parent().toggleClass('flex-one');
  });

  $('.save-button').on('click', function() {
    $(this).addClass('saved');
    $(this).text('Saved!');
  });

  $('.search-labels > label').on('click', function() {
    const checkbox = $(this);
    checkbox.toggleClass('selected');
    checkbox.children('input').prop('checked') === true ? checkbox.children('input').prop('checked', false) : checkbox.children('input').prop('checked', true);
    return false;
  });
});
