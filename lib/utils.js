utils = {};
utils.getSeatPlayer = function(seatNum) {
  let currentPlayer = Seats.findOne({seatNum: seatNum},{userId: true});
  // console.log('getSeatPlayer for seat ' + seatNum + ': ' + currentPlayer);
  return currentPlayer;
};

utils.getPlayerSeat = function(userId) {
  let seatNumObj = Seats.findOne({userId: userId}, {seatNum: true})
  if(typeof(seatNumObj) === 'undefined') {
    return seatNumObj;
  } else {
    return seatNumObj.seatNum;
  };
}

utils.isPlayer = function() {
  let currentPlayers = Seats.find({}, {userId: true}).fetch()
  return _.contains(_.pluck(currentPlayers, 'userId'), Meteor.userId());
}

utils.isOccupied = function(seatNum) {
  let seatPlayerObj = utils.getSeatPlayer(seatNum);
  let res = seatPlayerObj && seatPlayerObj.userId && seatPlayerObj !== null;
  // console.log('isOccupied' + JSON.stringify(utils.getSeatPlayer(seatNum)))
  return res;
}

utils.getTurns = function() {
  let currentPlayers = Seats.find({userId: {$ne: null}}, {seatNum: true}).fetch();
  let turnTrue = _.filter(currentPlayers, function(player) { return player.turn});
  let turns = {};
  if(turnTrue.length > 1) {
    // console.error('multiple players turn', turnTrue);
    turns.current = turnTrue;
  } else if(turnTrue.length === 1){
    let currTurn = turnTrue[0];
    turns.current = currTurn;
    let pos = _.indexOf(_.pluck(currentPlayers, 'seatNum'), currTurn.seatNum);
    if(pos === (currentPlayers.length - 1) ) {
      turns.next = currentPlayers[0];
    } else {
      turns.next = currentPlayers[pos+1];
    }
    // console.log('turns ', turns.current.seatNum + ' -> ' + turns.next.seatNum );
  } else {
    // seat 1 goes first
    turns.next = currentPlayers[0];
    // Seats.update({seatNum: firstTurn.seatNum}, {$set: {turn: true} });
  }
  return turns;
  // console.log('isOccupied' + JSON.stringify(utils.getSeatPlayer(seatNum)))
}

utils.modifyQuantity = function(userId, buyorsell, upordown) {
  let modifier = {$inc: {}};
  let label = (buyorsell === 'buy') ? 'buyQuantity' : 'sellQuantity'
  modifier.$inc[label] = (upordown === 'up') ? 1 : -1
  let rec = Seats.findOne({userId: userId});
  Seats.update(rec._id, modifier);
};
utils.playerSit = function(seatNum) {
  let user = Meteor.user()
  // console.log('playerSit cb', cb)
  // console.log('user', user);
  let playerSeatNum = utils.getPlayerSeat(user._id);
  if(playerSeatNum) {
    let msg = 'you are already in seat #' + playerSeatNum;
    console.log(msg);
    // if(typeof(cb) !== 'undefined') { cb(msg) };
    // return msg;
    throw new Meteor.Error("already-seated", msg);
  } else {
    if (!utils.isOccupied(seatNum)) {
      let orders = utils.getOrders();
      let mid = utils.currentMid(orders);
      let doc = {
          userId: user._id,
          seatNum: seatNum,
          // gameId: { type: String },
          userName: (function() {try {
              let userName = user.emails[0].address.split('@')[0];
              return userName
            } catch(err) {
              console.error(err);
              return user._id
            }})(),
          cash: 1000,
          stockOwned: 0,
          stockSymbol: 'AAPL',
          buyQuantity: 3,
          buyPrice: Math.round(mid*0.9),
          sellQuantity: 3,
          sellPrice: Math.round(mid*1.1),
      }
      let existing = Seats.findOne({ seatNum: seatNum });
      if(_.isUndefined(existing)) {
        Seats.insert(doc)
      } else {
        let res = Seats.update(existing._id, {$set: doc});
      }
    } else {
      let currentSeatPlayer = utils.getSeatPlayer(seatNum);
      let msg = 'seat ' + seatNum + ' already occupied by ' + currentSeatPlayer.userName;
      console.log(msg);
      // if(typeof(cb) !== 'undefined') { cb(msg) };
      throw new Meteor.Error("seat-occupied", msg);
      // return msg;
    };
  }
};

utils.playerLeave = function(seatNum) {
  let currSeat =  Seats.findOne({seatNum: seatNum},{_id: true});
  if (!_.isUndefined(utils.getSeatPlayer(seatNum))) {
    Seats.upsert(currSeat._id , {$set:{
        userId: null,
        userName: null,
        turn: false,
        orders: null
    }});
  }
};

utils.flipCard = function(opt_reset) {
  var randomCard;
  if(opt_reset) {
    randomCard = 'cardBack';
  } else {
    let cards = ['card1', 'card2', 'card3', 'card4'];
    randomCard = cards[Math.round(Math.random() * 3)];
  }

  // Session.set('card', cards[randomCard]);
  tabledoc = Table.findOne({stock: 'AAPL'});
  if(tabledoc) {
    Table.update(tabledoc._id, {$set: {card: randomCard}});
  } else {
    Table.insert({stock: 'AAPL', card: randomCard});
  }
};

utils.startTurn = function() {
  let turns = utils.getTurns()
  if(turns.current) {
    let currentSeat = Seats.findOne({seatNum: turns.current.seatNum});
    Seats.update(currentSeat._id, {$set: {turn: false} });
    // when it's the first person's turn again, flip a card
    if(turns.next.seatNum <= turns.current.seatNum) utils.flipCard()

  }



  let nextSeat = Seats.findOne({seatNum: turns.next.seatNum});
  Seats.update(nextSeat._id, {$set: {turn: true} });
};

utils.submitOrder = function(userId) {
  Feedback.provide("click");
  let orderDetails = Seats.findOne({userId: userId});
  Seats.update(orderDetails._id, { $set: {
    orders: {
      buy: {
        quantity: orderDetails.buyQuantity,
        price: orderDetails.buyPrice,
        filled: orderDetails.false,
        timeInput: new Date()
      },
      sell: {
        quantity: orderDetails.sellQuantity,
        price: orderDetails.sellPrice,
        filled: orderDetails.false,
        timeInput: new Date()
      }
    }
  }});
  utils.startTurn();
};

utils.currentMid = function (orders) {
  // console.log('currentMid', orders)
  let buy = _.max(orders.buy, function(order) {return order.price});
  let sell = _.min(orders.sell, function(order) {return order.price});
  var mid;
  if(!_.isEmpty(buy) && !_.isEmpty(sell)) {
    mid = Math.round((buy + sell) / 4) * 2;
  } else {
    mid = 100;
  }
  return  mid;
}

utils.getBuyOrders = function () {
  let orders = Seats.find({"orders.buy": {$exists: true}}, {sort: {"orders.buy.price": -1, "orders.buy.timeInput": 1}}).fetch();
  return orders;
}

utils.getSellOrders = function () {
  let orders = Seats.find({'orders.sell': {$exists: true}}, {sort: {"orders.sell.price": 1, "orders.sell.timeInput": 1}}).fetch();
  return orders;
}
utils.getOrders = function () {
  let orders = {};
  orders.buy = utils.getBuyOrders();
  orders.sell = utils.getSellOrders();
  return orders;
}

utils.seatData = function(field) {
  let doc = Seats.findOne({userId: Meteor.userId()});
  if(doc && doc[field]) {
    return doc[field]
  } else {
    return 'xx'
  }
}

utils.isCurrentTurn = function(seatNum) {
  let turns = utils.getTurns();
  let res = (!_.isUndefined(turns.current)) && (seatNum === turns.current.seatNum);
  return res;
}
utils.isUserTurn = function(userId) {
  let turns = utils.getTurns();
  let res = (!_.isUndefined(turns.current)) && (userId === turns.current.userId);
  // console.log('isUserTurn ' + JSON.stringify(res) + userId)
  return res;
}
utils.resetGame = function(userId) {
  _.map(_.range(4), function(i) {utils.playerLeave(i)})
}
