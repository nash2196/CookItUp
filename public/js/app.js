var app = angular.module('MainApp',['ngFileUpload']);

app.service('valueService',function(){
    this.selectedIngr = [];
    this.selectedMeal = '';
    this.selectedCuisine = '';

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


app.controller('IngrController', function($http, valueService) {
      $http.get('/types').then((response) => {
      this.types = response.data;
      });

      this.checkIngr = function(option){
        var ingr = JSON.stringify(option);
        var idx = valueService.getIngr().indexOf(ingr);
        if(idx>-1){
          valueService.getIngr().splice(idx,1);
        } else{
          valueService.addIngr(ingr);
        }
      };

      this.final = function(){
        console.log(valueService.getIngr());
      }
});


app.controller('MealController',function($http, valueService){

      //retrieve meal types and cuisine types
      $http.get('/meals').then((response) => {
        this.meal = response.data.meals;
        this.cuisine = response.data.cuisines;
      });


      this.clickedMeal = function(m,c){
        valueService.addMeal(JSON.stringify(m));
        valueService.addCuisine(JSON.stringify(c));
        //console.log(valueService.getMeal(),valueService.getCuisine());
      };
});


app.controller('RecipeController',function(valueService){

  this.recipes = recipes;
  this.selectedRecipe = [];
  this.ingredients = valueService.getIngr();

  this.showRecipe = () => {
    this.selectedRecipe = [];
    console.log(this.ingredients);

    if(this.ingredients.length==0){
        var meal = valueService.getMeal();
        var cuisine = valueService.getCuisine();
        //console.log("From showRecipe ",meal," ",cuisine);

        //if user selects both meal and cuisine type
        if((meal !== undefined) && (cuisine !== undefined)) {

          for(var i=0;i<this.recipes.length;i++){
            if(JSON.stringify(this.recipes[i].meal_type)===meal && JSON.stringify(this.recipes[i].cuisine_type)===cuisine){
              this.selectedRecipe.push(this.recipes[i]);
              console.log(this.selectedRecipe);
            };//end if
          }; //end for loop

        //if user selects only cuisine
      }else if(meal === undefined && cuisine!==undefined){

          for(var i=0;i<this.recipes.length;i++){
            if(JSON.stringify(this.recipes[i].cuisine_type)===cuisine){
              this.selectedRecipe.push(this.recipes[i]);
            }//end if
          }; //end for loop

        //if user selects only meal
      }else if(meal!== undefined && cuisine===undefined){

          for(var i=0;i<this.recipes.length;i++){
            if(JSON.stringify(this.recipes[i].meal_type)===meal){
              this.selectedRecipe.push(this.recipes[i]);
            }//end if
          }; //end for loop
        };

    }else {
      loop1:
      for (var i=0;i<this.ingredients.length;i++){
        var ingr = this.ingredients[i];
        // console.log("search param: ",ingr);
      loop2:
        for(var j=0;j<this.recipes.length;j++){
      loop3:
          for(var k=0;k<this.recipes[j].ingredients.length;k++){
            var recipe_ingr = JSON.stringify(this.recipes[j].ingredients[k]);
            // console.log("recipe ingr param: ",recipe_ingr);

            if(ingr==recipe_ingr && this.selectedRecipe.indexOf(this.recipes[j])<0){
              this.selectedRecipe.push(this.recipes[j]);
              console.log(this.selectedRecipe);
            };//end if
          };//end loop3
        };//end loop2
      };//end loop1

    }

  };

});

app.controller('MediaController', ['Upload', function(Upload){

  this.uploadPic = (file) => {
    file.upload = Upload.upload({
      url: '/upload/pic',
      data: {file: file}
    }).then((response) => {
          file.result = response.data;
    }, (response) => {
      if (response.status > 0){
        this.errorMsg = response.status + ': ' + response.data;
      }
    }, (evt) => {
      file.progress = parseInt(100.0 * evt.loaded / evt.total);
    });
  };
}]);


var recipes = [
  {
    id: "OTC",
    name: "Onion Tomato Curry",
    ingredients: ["Onion","Tomato"],
    images: ["recipe1-img1.jpeg","recipe1-img2.jpeg"],
    meal_type: "Lunch",
    cuisine_type: "Indian",
    author: "Aditya Patel",
    likes: 10
  },

  {
    id: "BS",
    name: "Banana Shake",
    ingredients: ["Milk","Banana"],
    images: ["recipe2-img1.jpeg","recipe2-img2.jpeg"],
    meal_type: "Breakfast",
    cuisine_type: "Italian",
    author: "Maitri Baria",
    likes: 20
  }
];
