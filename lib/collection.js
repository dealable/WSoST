
// var Games = new Mongo.Collection('games');
// var Players = new Mongo.Collection('players');
Seats = new Mongo.Collection('seats');
Orders = new Mongo.Collection('orders');

// Meteor.startup(function(){
//   if(Meteor.isServer) {
//     let minimumPlayers = 4;
//     let existingPlayers = Players.find({}).fetch();
//     // sampleOrders
//
//     if(existingPlayers.length < minimumPlayers) {
//       let newPlayersNum = minimumPlayers - existingPlayers;
//       console.log('creating ' + newPlayersNum + ' new players')
//       _.map(_.range(newPlayersNum), function(i) {
//         let newPlayer = {
//           // userName: chance.word() + chance.first()
//           userName: 'user' + i
//         }
//         console.log('creating player ' + JSON.stringify(newPlayer));
//         Players.insert(newPlayer);
//       });
//     }
//
//     let existingPlayers2 = Players.find({}).fetch();
//     _.map(existingPlayers2, function(player) {
//       let existingOrder = Orders.find({}).fetch();
//       if(existingOrder.length === 0) {
//         let stockSymbol = 'AAPL';
//
//         let newOrderBuy = {
//           userId: player._id,
//           direction: 'buy',
//           quantity: 3,
//           price: 98
//           timeInput: new Date,
//           timeFilled: { type: Date },
//           orderFilled: false
//         };
//
//         let newOrderSell = {
//           userId: player._id,
//           direction: 'sell',
//           quantity: 3,
//           price: 98
//           timeInput: new Date,
//           timeFilled: { type: Date },
//           filled: false
//         };
//
//         console.log('creating orders for ' + player.userName + ': ' + JSON.stringify(newOrderBuy) + JSON.stringify(newOrderSell));
//         Games.upsert(
//           {
//             users: player.userId,
//             stock: stockSymbol,
//             order.userId: player._id,
//             order.filled: false,
//             order.direction: 'sell'
//           },
//           {
//             'orders.$': newOrderSell
//           }
//         );
//         Games.upsert(
//           {
//             users:
//             stock: stockSymbol
//             orders: newOrderSell
//           }
//         );
//       }
//
//     })
//   };
// });

Schemas = {};

Schemas.Seats = new SimpleSchema({
  seatNum: { type: Number },
  userId: { type: String },
  // gameId: { type: String },
  userName: { type: String },
  cash: { type: Number },
  stockSymbol: { type: String },
  buyQuantity: { type: Number },
  sellQuantity: { type: Number },
  turn: { type: Boolean }
});

Schemas.Orders = new SimpleSchema({
  userId: { type: String },
  // gameId: { type: String },
  stockSymbol: { type: String },
  direction: { type: String },
  quantity: { type: Number },
  price: { type: String },
  timeInput: { type: Date },
  timeFilled: { type: Date, optional: true },
  orderFilled: { type: Boolean }
});

Schemas.Games = new SimpleSchema({
  users: { type: [String] },
  stock: { type: String },
  orders: { type: Schemas.Orders }
});
