AccountsTemplates.configure({
  negativeValidation: true,
  negativeFeedback: true,
  positiveValidation: true,
  positiveFeedback: true,

  onSubmitHook: function(error, state){
    if (!error) {
      if (state === "signIn") {
        // Successfully logged in
        Router.go('/map');
      }
      if (state === "signUp") {
        // Successfully registered
        Router.go('/map');
      }
    }
  },
  onLogoutHook: function(){
    Router.go('/');
  }
});