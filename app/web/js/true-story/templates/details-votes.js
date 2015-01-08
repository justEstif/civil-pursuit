! function () {

  'use strict';

  module.exports = {
    template: '.votes-by-criteria',
    controller: function (view, details) {
      details.criterias.forEach(function (criteria) {
        view.find('h4').text(criteria.name);

        var vote = details.votes[criteria._id];

        var svg = $('<svg class="chart"></svg>');

        view.find('.chart').append(svg);
      });
    }
  };

} ();
