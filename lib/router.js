Router.configure({
  layoutTemplate: 'phoneView'
});

Router.route('/', function () {
  this.render('intro');
});

Router.route('/signin', function () {
  if(Meteor.user()) {
    Router.go('/AAPL');
  } else {
    this.render('signin');
  };
});

AccountsTemplates.configure({
  onSubmitHook: function(error, state){
    if (!error) {
      Router.go('/AAPL')

      // if (state === "signIn") {
      // }
      // if (state === "signUp") {
      // }
    }
  }
});

Router.route('/AAPL', function () {

  if(Meteor.user()) {
    this.render('game');
  } else {
    Router.go('/signin');
  };
});
// Router.map(function() {
//     this.route('game', {
//         path: '/',
//     });
//
//     this.route('private');
// });
