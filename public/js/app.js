var app = angular.module('MainApp',[]);

app.service('ingrService',function(){
    var selectedIngr = [];

    var addIngr = function(ingr){
      selectedIngr.push(ingr);
    };

    var getIngr = function(){
      return selectedIngr;
    };

    return {
      addIngr: addIngr,
      getIngr: getIngr
    };
});


app.controller('IngrController', function($http, ingrService) {
      $http.get('/types').then((response) => {
      this.types = response.data;
      });

      this.checkIngr = function(option){
        var ingr = JSON.stringify(option);
        var idx = ingrService.getIngr().indexOf(ingr);
        if(idx>-1){
          ingrService.getIngr().splice(idx,1);
        } else{
          ingrService.addIngr(ingr);
        }
      };

      this.final = function(){
        console.log(ingrService.getIngr());
      }
});


app.controller('MealController',function($http){

      $http.get('/meals').then((response) => {
        this.meal = response.data.meals;
        this.cuisine = response.data.cuisines;
      });

      var selectedMeal = selectedCuisine = '';

      this.clickedMeal = function(m,c){
        selectedMeal = JSON.stringify(m);
        selectedCuisine = JSON.stringify(c);
        console.log(selectedMeal,selectedCuisine);
      };
});


app.controller('RecipeController',function(ingrService){

  this.recipes = recipes;
  this.selectedRecipe = [];
  var ingredients = ingrService.getIngr();
  this.showRecipe = function(){
    console.log(ingredients);
    if(ingredients==[]){

    }else {
      loop1:
      for (var i=0;i<ingredients.length;i++){
        var ingr = ingredients[i];
        // console.log("search param: ",ingr);
      loop2:
        for(var j=0;j<this.recipes.length;j++){
      loop3:
          for(var k=0;k<this.recipes[j].ingredients.length;k++){
            var recipe_ingr = JSON.stringify(this.recipes[j].ingredients[k]);
            // console.log("recipe ingr param: ",recipe_ingr);
            if(ingr==recipe_ingr){
              this.selectedRecipe.push(this.recipes[j]);
              console.log(this.selectedRecipe[0]);
              break loop1;
            };
          };
        };
      };

    }
  };



});


var recipes = [
  {
    name: "Onion Tomato",
    ingredients: ["Onion","Tomato"],
    images: ["recipe1-img1.jpeg","recipe1-img2.jpeg"],
    meal_type: "Lunch",
    cuisine_type: "Indian",
    author: "Aditya Patel",
    likes: 0
  },

  {
    name: "Milk Banana",
    ingredients: ["Milk","Banana"],
    images: ["recipe2-img1.jpeg","recipe2-img2.jpeg"],
    meal_type: "Breakfast",
    cuisine_type: "Italian",
    author: "Maitri Baria",
    likes: 20
  }
];
