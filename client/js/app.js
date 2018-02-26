var app = angular.module('MainApp',['ngFileUpload','routes']);

app.service('authService',function($http){

  this.loggedIn = false;

  var setLogin = (userData) => {
    return $http.post('/login',userData)
    // .then((response)=>{
    //   if(response.status === 200 && response.data === "Success"){
    //     this.loggedIn=true;
    //     console.log("set: ",this.loggedIn);
    //     }
    // },(response)=>{
    //   this.loggedIn=false;
    //   });
    };

  var checkLogin = () => {
    // $http.get('/login').then((response)=>{
    //   if(response.status===200){
    //     this.loggedIn = true;
    //   }
    // },(response)=>{
    //   this.loggedIn = false;
    // });
    return this.loggedIn;
  };

  return {
    checkLogin : checkLogin,
    setLogin : setLogin
  };

});

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

// app.controller('LoginController',function($http,authService){
//     //this.loggedIn = authService.checkLogin();
//     this.login = (form) => {
//       var userData = {
//         email : form.uname,
//         pswd : form.pswd
//       }
//       authService.setLogin(userData);
//       authService.checkLogin();
//     }
// });

app.controller('HeaderController',function($stateParams,authService){
  this.loggedIn = $stateParams;
  console.log("headCtrl login: ",this.loggedIn);
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

      // this.final = function(){
      //   console.log(valueService.getIngr());
      // }
});


app.controller('MealController',function($http, valueService){

      //retrieve meal types and cuisine types
      $http.get('/meals').then((response) => {
        this.meal = response.data.meals;
        this.cuisine = response.data.cuisines;
      });


      this.selectMeal = function(m){
        valueService.addMeal(m);
        console.log(valueService.getMeal(),valueService.getCuisine());
      };

      this.selectCuisine = function(c){
        valueService.addCuisine(c);
        console.log(valueService.getMeal(),valueService.getCuisine());
      };
});


app.controller('RecipeController',function($http, valueService){

  $http.get('/recipes').then((response)=>{
    this.recipes = response.data;
  });
  // this.recipes = recipes;
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
        if((meal !== null) && (cuisine !== null)) {

          for(var i=0;i<this.recipes.length;i++){
            if(this.recipes[i].meal_type===meal && this.recipes[i].cuisine_type===cuisine){
              this.selectedRecipe.push(this.recipes[i]);
              console.log(this.selectedRecipe);
            };//end if
          }; //end for loop

        //if user selects only cuisine
      }else if(meal === null && cuisine !== null){

          for(var i=0;i<this.recipes.length;i++){
            if(this.recipes[i].cuisine_type===cuisine){
              this.selectedRecipe.push(this.recipes[i]);
            }//end if
          }; //end for loop

        //if user selects only meal
      }else if(meal !== null && cuisine === null){

          for(var i=0;i<this.recipes.length;i++){
            if(this.recipes[i].meal_type===meal){
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

app.controller('MediaController', ['Upload','$http','valueService', function(Upload,$http,valueService){

  var uuid = null;

  this.uploadPic = (file) => {

    if(uuid === null){
    file.upload = Upload.upload({
      url: '/upload/pic',
      data: {file: file}
    }).then((response) => {
          file.result = uuid = response.data;
    }, (response) => {
      if (response.status > 0){
        this.errorMsg = response.status + ': ' + response.data;
      }
    }, (evt) => {
      file.progress = parseInt(100.0 * evt.loaded / evt.total);
    });

  }else{
    file.upload = Upload.upload({
      url: '/upload/pic',
      data: {file: file, 'uuid':uuid}
    }).then((response) => {
          file.result = uuid = response.data;
    }, (response) => {
      if (response.status > 0){
        this.errorMsg = response.status + ': ' + response.data;
      }
    }, (evt) => {
      file.progress = parseInt(100.0 * evt.loaded / evt.total);
    });
  }
  };

this.uploadData = (form) => {

  var formData = {
    uuid:uuid,
    recipeName: form.recipeName,
    ingredients:valueService.getIngr(),
    meal_type:valueService.getMeal(),
    cuisine_type:valueService.getCuisine(),
    method: form.method,
    time: form.time,
    serves: form.serve,
    taste: form.taste
  };

  console.log(formData);

  $http.post('/upload/data',formData)
  .then((response) => {
    console.log("Success! UUID:",response.data);
  }, (response) => {
   console.log("Error:",response.status,":::",response.data);
 });
};

}]);



app.run(['$rootScope', '$state', '$stateParams',
  function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
}]);
