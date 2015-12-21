AccountsTemplates.configure({
  negativeValidation: true,
  negativeFeedback: true,
  positiveValidation: false,
  positiveFeedback: false,

  onSubmitHook: function(error, state){
    if (!error) {
      if (state === "signIn") {
        // Successfully logged in
        Router.go('/map');
      }
      if (state === "signUp") {
        // Successfully registered
        Router.go('/addProfile');
      }
    }
  },
  onLogoutHook: function(){
    Router.go('/');
  }
});