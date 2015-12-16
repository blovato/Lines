Template.layout.events({
  'click [data-action=logout]': function () {
    AccountsTemplates.logout();
    IonPopup.alert({
      template: 'You have been logged out!',
      okText: 'Got It.'
    });
  }
});

