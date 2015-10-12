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
  });

  // counter starts at 0
  Session.setDefault('card', 'cardBack');

  Template.game.helpers({
    counter: function () {
      return Session.get('counter');
    },
    showCard: function() {
      return Session.get('card');
    },
    isPlayer: utils.isPlayer,
    isOccupied: utils.isOccupied,
    seatPlayer: function(seatNum) {
      let res = utils.getSeatPlayer(seatNum).userName;
      console.log('seatPlayer' + res);
      return res;
    },
    isThisPlayer: function(seatNum) {
      let res = Meteor.userId() === utils.getSeatPlayer(seatNum).userId;
      return res;
    },
    gameOn: function() {
      let turns = utils.getTurns()
      return !!turns.current
    },
    isCurrentTurn(seatNum) {
      let turns = utils.getTurns();
      let res = (!_.isUndefined(turns.current)) && (seatNum === turns.current.seatNum);
      console.log('isCurrentTurn turns', turns);
      console.log('isCurrentTurn', res);
      return res;
    }

  });
  let cb = function(err, res) {
    if(err) {
      console.warn(err);
      if(err.message) alert(err.message)
    }

    if(res) {
      console.log(res);
    }
  }
  Template.game.events({
    'click #seat1': function() {Meteor.call('playerSit', 1,cb)},
    'click #seat2': function() {Meteor.call('playerSit', 2,cb)},
    'click #seat3': function() {Meteor.call('playerSit', 3,cb)},
    'click #seat4': function() {Meteor.call('playerSit', 4,cb)},
    'click #leave1': function() {Meteor.call('playerLeave', 1,cb)},
    'click #leave2': function() {Meteor.call('playerLeave', 2,cb)},
    'click #leave3': function() {Meteor.call('playerLeave', 3,cb)},
    'click #leave4': function() {Meteor.call('playerLeave', 4,cb)},
    'click #startGame': function() {Meteor.call('startTurn', cb)}
  });

  Template.game.rendered = function () {
    Feedback.provide("gameMusic");
  };

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

  Template.controls.helpers({
    buyQuantity: function() {
      return Seats.findOne({userId: Meter.userId}).buyQuantity
    },
    sellQuantity: function() {
      let sellQ = Seats.findOne({userId: Meter.userId}).sellQuantity;
      console.log('sellQ', sellQ);
      return sellQ;
    }
  });
  Template.playersSeated .helpers({
    playersSeated : function() {
      return Seats.find({userId: {$ne: null}}).fetch()
    }
  });
  // Template.registerHelper('cardPattern', function)
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
