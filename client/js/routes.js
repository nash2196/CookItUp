var app = angular.module('routes',['ui.router']);

app.config(($stateProvider,$urlRouterProvider)=>{
  $urlRouterProvider.otherwise('/home')

  $stateProvider
  .state('home', {
    url : '/home',
    templateUrl : '/views/home.html'
  })

  .state('login', {
    url : '/login',
    templateUrl : '/views/login_page.html',
    authenticated :false
  })

  .state('signup', {
    url : '/signup',
    templateUrl : '/views/signup_page.html',
    authenticated :false
  })

  .state('recipe-view', {
    url : '/recipe/:recipeID',
    templateUrl : '/views/recipe-view.html',
    resolve : {
      getRecipe : function($http,$stateParams){
        return $http.get('/recipe/'+$stateParams.recipeID);
      }
    },
    controller : function($http,$timeout,getRecipe,$state) {
      this.recipe = getRecipe.data;
      this.commentSuccess=false;
      this.commentError=false;
      this.recipe.addComment = (userid,comment) => {
         $http.post('/recipe/comment',{recipeID : this.recipe.recipe_name,userID : userid,comment : comment})
         .then((response)=>{
           if(response.data.success){
                this.commentSuccess = true;
                this.userComment = null;
                $timeout(()=>{
                  $state.reload();
                },2000);
           }else{
             this.commentError = true;
           };
         });
      };
    },
    controllerAs : 'recipeViewCtrl'

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
    controllerAs : 'tab',
    authenticated :true
  })

  .state('user.edit', {
    url : '/edit-profile',
    templateUrl : '/views/edit_profile.html',
    authenticated :true
  })

  .state('user.add', {
    url : '/add-recipe',
    templateUrl : '/views/add_recipe.html',
    authenticated : true
  })

  .state('user.fav', {
    url : '/favourite',
    templateUrl : '/views/fav_recipes.html',
    authenticated : true
  })

  .state('user.profile', {
    url : '/info',
    templateUrl : '/views/profile.html',
    authenticated : true
  })

});


app.run(['$transitions','$state', 'authService', function ($transitions,$state,authService) {
    $transitions.onStart({to : '**'},function (trans) {

      if(trans.to().authenticated == true){
        if(!authService.isLoggedIn()){
          return false;
        };

      }else if(trans.to().authenticated == false){
        if(authService.isLoggedIn()){
          return false;
        }
      };

    });
}]);
