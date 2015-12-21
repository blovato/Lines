Meteor.subscribe('UserProfile');

AutoForm.hooks({
  'update-profile-form': {
    onSuccess: function (operation, result, template) {
      Router.go('/map');
    },
    onError: function(operation, error, template) {
      console.log(error);
    }
  }
});

Template.updateProfile.rendered = function(){
  // hide userID field
  $('#update-profile-form label').last().hide();
}

Template.updateProfile.helpers({
  selectedProfileDoc: function () {
    var currentUserId = Meteor.userId();
    return UserProfile.findOne({userId: currentUserId});
  }
});