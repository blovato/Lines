Meteor.subscribe('UserProfile');

AutoForm.hooks({
  'insert-profile-form': {
    onSuccess: function (operation, result, template) {
      Router.go('/map');
    },
    onError: function(operation, error, template) {
      console.log(error);
    }
  }
});

Template.addProfile.rendered = function(){
  // enter user ID to the form, then hide the field
  var currentUserId = Meteor.userId();
  $('input[name*="userId"]').val(currentUserId);
  $('#insert-profile-form label').last().hide();
}