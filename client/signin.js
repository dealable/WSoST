
if (Meteor.isClient) {
  Template.intro.events({
    'click': function () {
      Router.go('/signin');
    }
  });
};
