Meteor.methods({
  stopGame: function() {

  },
  startTurn: function() {
    let turns = utils.getTurns()
    if(turns.current) {
      Seats.update({seatNum: turns.current.seatNum}, {$set: {turn: false} });
    }
    Seats.update({seatNum: turns.next.seatNum}, {$set: {turn: true} });
  },
  playerSit: function(seatNum) {
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
        Seats.upsert({
          seatNum: seatNum,
        }, {$set:{
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
            cash: 10000,
            stockSymbol: 'AAPL',
            buyQuantity: 3,
            sellQuantity: 3
          }});
      } else {
        let currentSeatPlayer = utils.getSeatPlayer(seatNum);
        let msg = 'seat ' + seatNum + ' already occupied by ' + currentSeatPlayer.userName;
        console.log(msg);
        // if(typeof(cb) !== 'undefined') { cb(msg) };
        throw new Meteor.Error("seat-occupied", msg);
        // return msg;
      };
    }
  },
  playerLeave: function(seatNum) {
    if (!_.isUndefined(utils.getSeatPlayer(seatNum))) {
      Seats.upsert({
        seatNum: seatNum,
      }, {$set:{
          userId: null,
          userName: null
      }});
    }
  }
});
