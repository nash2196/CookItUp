var app = angular.module('MainApp',[]);

app.controller('IngrController', function($http) {
      $http.get('/types').then((response) => {
      this.types = response.data;
      });

      this.selectedIngr = [];

      this.checkIngr = function(option){
        var ingr = JSON.stringify(option);
        var idx = this.selectedIngr.indexOf(ingr);
        if(idx>-1){
          this.selectedIngr.splice(idx,1);
        } else{
          this.selectedIngr.push(ingr);
        }
      };

      this.final = function(){
        console.log(this.selectedIngr);
      };
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
