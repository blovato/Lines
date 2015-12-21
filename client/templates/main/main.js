Template.main.events({
  'click [data-action=logout]': function () {
    AccountsTemplates.logout();
    IonPopup.alert({
      template: 'You have been logged out!',
      okText: 'Got It.'
    });
  	Session.set('showLogin', false);
  },
  'click [data-action=login]': function() {
  	Session.set('showLogin', true);
    $('.podbar').hide(1000);
  }
});

Template.main.helpers({
	'showLoginTemplate': function(){
		return Session.get('showLogin');
	}
});

Tracker.autorun(function() {
  if (Meteor.userId()) {
    Session.set('showLogin', false);
  }
});
