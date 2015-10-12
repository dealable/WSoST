
if (Meteor.isClient) {
  // Feedback = {};
  // Feedback.provide = function() { return };

  Feedback.profiles = {
    "gameMusic": {
      sound: "FunkyChunk.mp3",
      vibrate: [500,50,500,50,100]
    },
    "click": {
      sound: "201809__fartheststar__poker-chips5.wav",
      vibrate: [50]
    }
  }

  Template.game.helpers({
    showCard: function() {
      let tabledoc = Table.findOne({stock: 'AAPL'});
      console.log('client card', tabledoc)
      if (tabledoc) {
        return tabledoc.card;
      } else {
        return 'cardBack';
      }
    },
    isPlayer: utils.isPlayer,
    isOccupied: utils.isOccupied,
    seatPlayer: function(seatNum) {
      let res = utils.getSeatPlayer(seatNum).userName;
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
    isCurrentTurn: utils.isCurrentTurn

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
    'click #seat1': function() {utils.playerSit(1,cb)},
    'click #seat2': function() {utils.playerSit(2,cb)},
    'click #seat3': function() {utils.playerSit(3,cb)},
    'click #seat4': function() {utils.playerSit(4,cb)},
    'click #leave1': function() {utils.playerLeave(1,cb)},
    'click #leave2': function() {utils.playerLeave(2,cb)},
    'click #leave3': function() {utils.playerLeave(3,cb)},
    'click #leave4': function() {utils.playerLeave(4,cb)},
    'click #startGame': function() {utils.startTurn(cb)},
    'click #buyUp': function() {utils.modifyQuantity(Meteor.userId(), 'buy', 'up', cb)},
    'click #buyDown': function() {utils.modifyQuantity(Meteor.userId(), 'buy', 'down', cb)},
    'click #sellUp': function() {utils.modifyQuantity(Meteor.userId(),  'sell', 'up', cb)},
    'click #sellDown': function() {utils.modifyQuantity(Meteor.userId(),  'sell', 'down', cb)},
    'click #submitOrder': function() {utils.submitOrder(Meteor.userId(),  'sell', 'down', cb)},
    'click #quitGame': function() {Meteor.logout()},
    'click #resetGame': function() {utils.resetGame()}
  });

  Template.game.rendered = function () {
    Feedback.provide("gameMusic");
  };

  Template.controls.rendered = function () {
    let orders = utils.getOrders();
    let mid = utils.currentMid(orders);
    this.$("#slider").noUiSlider({
      start: [mid*0.9, mid*1.1],
      step: 2,
    	connect: true,
      behaviour: 'tap-drag',
    	range: {
    		'min': mid/2,
    		'max': mid*2,
    	},
      pips: { // Show a scale with the slider
        mode: 'steps',
        density: 2
      }
    }).on('slide', function (ev, val) {
      // set real values on 'slide' event
      Session.set('slider', val);
      let currPlayer = Seats.find({userId: Meteor.userId()}).fetch();
      [buyPrice, sellPrice] = val;
      let res = Seats.update(currPlayer[0]._id, {$set: {buyPrice: buyPrice, sellPrice: sellPrice}});
    });
  };

  Template.controls.helpers({
    buyQuantity: function() {
      return Seats.findOne({userId: Meteor.userId()}).buyQuantity;
    },
    sellQuantity: function() {
      return Seats.findOne({userId: Meteor.userId()}).sellQuantity;
    },
    buyPrice: function() {
      return Seats.findOne({userId: Meteor.userId()}).buyPrice;
    },
    sellPrice: function() {
      return Seats.findOne({userId: Meteor.userId()}).sellPrice;
    },
    isUserTurn: utils.isUserTurn,
    currentPlayer: function() {
      let turns = utils.getTurns();
      if(turns.current) {
        let currentSeat = Seats.findOne({seatNum: turns.current.seatNum});
        return currentSeat.userName;
      }
    }
  });
  Template.playersSeated .helpers({
    playersSeated : function() {
      return Seats.find({userId: {$ne: null}}).fetch()
    }
  });

  Template.orderBook.helpers({
    buyOrders: utils.getBuyOrders,
    sellOrders: utils.getSellOrders
  });
  Template.balances.helpers({
    bid: function() {
      let orders = utils.getBuyOrders();
      if (orders.length !== 0) {
        return Math.round(orders[0].orders.buy.price);
      } else {
        return 'xx'
      }
    },
    offer:  function() {
      let orders = utils.getSellOrders();
      if (orders.length !== 0) {
        return Math.round(orders[0].orders.sell.price);
      } else {
        return 'xx'
      }
    },
    seatData: utils.seatData,
    gain: function() {
      let doc = Seats.findOne({userId: Meteor.userId()});
      if(doc) {
        return Math.round(doc.cash / doc.cash * 100 - 100);
      } else {
        return 'xx'
      }
    },
    nav: function() {
      let doc = Seats.findOne({userId: Meteor.userId()});
      let orders = utils.getOrders();
      let mid = utils.currentMid(orders);
      if(doc) {
        return Math.round(doc.cash + doc.stockOwned * mid);
      } else {
        return 'xx'
      }
    }
  });
  // Template.registerHelper('cardPattern', function)
}

Meteor.startup(function () {
  utils.flipCard(true);
});
