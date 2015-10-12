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
    console.error('multiple players turn', turnTrue);
    turns.current = turnTrue;
  } else if(turnTrue === 1){
    let currTurn = turnTrue[0];
    turns.current = currTurn;
    let pos = _.indexOf(_.pluck(currentPlayers, 'seatNum'), currTurn.seatNum);
    if(pos === (currentPlayers.length - 1) ) {
      turns.next = currentPlayers[0];
    } else {
      turn.next = currentPlayers[pos+1];
    }
    console.log('turns ', turns);
  } else {
    // seat 1 goes first
    turns.next = currentPlayers[0];
    // Seats.update({seatNum: firstTurn.seatNum}, {$set: {turn: true} });
  }
  return turns;
  // console.log('isOccupied' + JSON.stringify(utils.getSeatPlayer(seatNum)))
}
