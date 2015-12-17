$(document).ready(function(){
  $("button #at-btn").css("data-dismiss", "modal");
});

Template._userAccounts.events({
  'click [data-action=logout]': function () {
    AccountsTemplates.logout();
  }
});

var myPostLogout = function(){
  //example redirect after logout
  Router.go('/map');
};

AccountsTemplates.configure({
  onLogoutHook: myPostLogout
});