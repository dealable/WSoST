if (Meteor.isClient) {

  Feedback.profiles = {
    "gameMusic": {
      sound: "FunkyChunk.mp3",
      vibrate: [500,50,500,50,100]
    },
    "click": {
      sound: "201809__fartheststar__poker-chips5.wav",
      vibrate: [500,50,500,50,100]
    }
  }

  Meteor.startup(function(){
    Feedback.provide("gameMusic");
  });

  // counter starts at 0
  Session.setDefault('card', 'cardBack');

  Template.home.helpers({
    counter: function () {
      return Session.get('counter');
    },
    showCard: function() {
      return Session.get('card');
    }
  });

  Template.home.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });

  Template.controls.rendered = function () {
    $('input[type="rangeslide"]').ionRangeSlider(
      {
        type: "double",
        grid: true,
        min: 0,
        max: 1000,
        from: 100,
        to: 1000,
        step: 100
      }
    )
  };

  // Template.registerHelper('cardPattern', function)
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
