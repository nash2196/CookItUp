var app = angular.module('menu-directives',[]);

app.directive('editProfile', function(){
  return{
    restrict : "E",
    templateUrl : "edit_profile.html"
  };
});

app.directive('addRecipe', function(){
  return{
    restrict : "E",
    templateUrl : "add_recipe.html"
  };
});

app.directive('favRecipes', function(){
  return{
    restrict : "E",
    templateUrl : "fav_recipes.html",
  };

});

app.controller('MenuController', function(){
    this.tab = 1;
    this.isSet = function(checkTab) {
        return this.tab === checkTab;
      };

    this.setTab = function(activeTab) {
        this.tab = activeTab;
      };
});
