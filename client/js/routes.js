var app = angular.module('routes',['ui.router']);

app.config(($stateProvider,$urlRouterProvider)=>{
  $urlRouterProvider.otherwise('/home')

  $stateProvider
  .state('home', {
    url : '/home',
    templateUrl : '/views/home.html',
    params : { loggedIn : false}
  })

  .state('login', {
    url : '/login',
    templateUrl : '/views/login_page.html',
    controller : function($http,$state,authService){

      this.login = (form) => {
        var userData = {
          email : form.uname,
          pswd : form.pswd
        }
        authService.setLogin(userData)
          .then((response)=>{
            if(response.status === 200 && response.data === "Success"){
              console.log("going home");
              $state.go('user.profile',{userID : 'nishant'});
            }
          }, (response)=>{
            console.log("error in login");
            $state.reload();
          });
      };
    },
    controllerAs : 'loginCtrl'
  })

  .state('signup', {
    url : '/signup',
    templateUrl : '/views/signup_page.html'
  })

  .state('recipe-view', {
    url : '/recipe/:recipeID',
    templateUrl : '/views/recipe-view.html',
    params : { recipeID : null}
  })

  .state('user', {
    url : '/user/:userID',
    templateUrl : '/views/user_profile.html',
    abstract : true,
    controller : function () {
      this.tab = 1;
      this.isSet = function(checkTab) {
          return this.tab === checkTab;
        };

      this.setTab = function(activeTab) {
          this.tab = activeTab;
        };
    },
    controllerAs : 'tab'
  })

  .state('user.edit', {
    url : '/edit-profile',
    templateUrl : '/views/edit_profile.html'
  })

  .state('user.add', {
    url : '/add-recipe',
    templateUrl : '/views/add_recipe.html'
  })

  .state('user.fav', {
    url : '/favourite',
    templateUrl : '/views/fav_recipes.html'
  })

  .state('user.profile', {
    url : '/info',
    templateUrl : '/views/profile.html'
  })

});
