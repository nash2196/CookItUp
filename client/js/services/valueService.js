var app = angular.module('ValueService',[]);
app.service('valueService',function(){
    this.selectedIngr = [];
    this.selectedMeal = null;
    this.selectedCuisine = null;

    //ingredients selected
    var addIngr = (ingr) => {
      this.selectedIngr.push(ingr);
    };
    var getIngr = () => {
      return this.selectedIngr;
    };

    //meal type selected
    var addMeal = (meal_type) => {
      this.selectedMeal = meal_type;
    };
    var getMeal = () => {
      return this.selectedMeal;
    };

    //cuisine type selected
    var addCuisine = (cuisine_type) => {
      this.selectedCuisine = cuisine_type;
    };
    var getCuisine = () => {
      return this.selectedCuisine;
    };


    return {
      addIngr: addIngr,
      getIngr: getIngr,
      addMeal: addMeal,
      getMeal: getMeal,
      addCuisine: addCuisine,
      getCuisine: getCuisine
    };
});
