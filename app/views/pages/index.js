! function () {
  
  'use strict';

  require('syn/lib/html5');


  var LandingPage

  module.exports = LandingPage;

} ();


extends ../layout
include ../mixins/panel
include ../mixins/item-box


block page
  // Intro
  #intro
    include ../partials/intro

  .panels
    - if ( batch )
      
      - if ( item.type === 'Topic' )
        +panel({ type: 'Topic', items: [item].concat(batch.entourage.items) })
      
      - else if ( item.type === 'Problem' )
        - var topic = batch.lineage[0];
        - topic.nested = [item];
        +panel({ type: 'Topic', items: [topic] })
      
      - else if ( item.type === 'Agree' || item.type === 'Disagree')
        - var topic = batch.lineage[0];
        - var problem = batch.lineage[1];
        - topic.nested = [problem];
        - problem.nested = [item];
        +panel({ type: 'Topic', items: [topic] })
