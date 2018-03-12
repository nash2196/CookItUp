var app = angular.module('MainApp',['ngFileUpload','routes','ValueService','AuthService']);

app.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptors');
});

app.controller('MainController',function(authService,$timeout,$state,$transitions){


  $transitions.onStart({},() => {
    if(authService.isLoggedIn()) {
      console.log("User is logged in");
      this.isLoggedIn = true;
      authService.getUser().then((response) => {
        this.username =  response.data.username;
        this.userid = response.data.email;
      });
    }else {
      console.log("Not logged in");
      this.isLoggedIn = false;
      this.username = null;
    };

  });

  this.doLogin =  (formData) => {
    this.errorMsg = false;

    var loginData = {
          email : formData.uname,
          pswd : formData.pswd
    };
    authService.login(loginData).then((response)=>{
      if(response.data.success){
        this.successMsg = response.data.message + "...Redirecting";

        $timeout(() => {
          $state.go('user.profile',{userID : response.data.name.trim()});
          this.successMsg = null;
        },2000);
      }else{
        this.errorMsg = response.data.message;
      }
    });
  };


  this.logout = function () {
    authService.logout();
    if($state.is('home')){
      $state.reload();
    }else {
      $state.go('home');
    }

  };
});

// app.controller('HeaderController',function($stateParams,authService){
//   this.loggedIn = $stateParams;
//   console.log("headCtrl login: ",this.loggedIn);
// });

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

      this.selected = valueService.getIngr();
      this.detail = null;

      this.selectDetail = function (type){
        this.detail=type;
      };

      this.detailsIsSelected = function(type){
        return this.detail===type;
      }

});


app.controller('MealController',function($http, valueService){

      //retrieve meal types and cuisine types
      $http.get('/meals').then((response) => {
        this.meal = response.data.meals.meals;
        this.cuisine = response.data.cuisines.cuisines;
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
  // this.recipes = recipes

  this.searchRecipe = () => {

    var _ingredients = valueService.getIngr();
    var _meal = valueService.getMeal();
    var _cuisine = valueService.getCuisine();

    this.selectedRecipe = [];

    if(_ingredients.length==0){
        this.selectedRecipe = searchByMealCuisine(_meal,_cuisine);
    }else if(_meal === null && _cuisine === null){
        this.selectedRecipe = searchByIngredients(_ingredients);
    }else{
        var temp = searchByIngredients(_ingredients);
        this.selectedRecipe = searchByMealCuisine(_meal,_cuisine,temp);
    }//end else
  };//end searchRecipe

  var searchByMealCuisine = (meal,cuisine,temp) => {

    if(temp===undefined){
        var _recipes = this.recipes;
    }else {
      var _recipes = temp;
    };
    var selectedRecipe = [];

    if((meal !== null) && (cuisine !== null)) {

        for(var i=0;i<_recipes.length;i++){
          if(_recipes[i].mealtype===meal && _recipes[i].cuisinetype===cuisine){
            selectedRecipe.push(_recipes[i]);
            console.log("From searchByMealCuisine(): ",selectedRecipe);
          };//end if
        }; //end for loop

        //if user selects only cuisine
      }else if(meal === null && cuisine !== null){

        for(var i=0;i<_recipes.length;i++){
          if(_recipes[i].cuisinetype===cuisine){
            selectedRecipe.push(_recipes[i]);
          }//end if
        }; //end for loop

        //if user selects only meal
      }else if(meal !== null && cuisine === null){

        for(var i=0;i<_recipes.length;i++){
          if(_recipes[i].mealtype===meal){
            selectedRecipe.push(_recipes[i]);
          }//end if
        }; //end for loop
      };

    return selectedRecipe;
  };

  var searchByIngredients = (ingredients) => {
    var selectedRecipe = [];
    var _recipes = this.recipes;

    loop1:
    for (var i=0;i<ingredients.length;i++){
      var ingr = ingredients[i];
      // console.log("search param: ",ingr);
    loop2:
      for(var j=0;j<_recipes.length;j++){
    loop3:
        for(var k=0;k<_recipes[j].ingredients.length;k++){
          var recipe_ingr = JSON.stringify(_recipes[j].ingredients[k]);
          // console.log("recipe ingr param: ",recipe_ingr);

          if(ingr==recipe_ingr && selectedRecipe.indexOf(_recipes[j])<0){
            selectedRecipe.push(_recipes[j]);
            console.log(selectedRecipe);
          };//end if
        };//end loop3
      };//end loop2
    };//end loop1

    return selectedRecipe;
  }


});

app.controller('FormController', function(Upload,$http,$timeout,$state,valueService){

  var uuid = null;
  this.successMsg = null;
  this.errorMsg = null;

  this.uploadPic = (file) => {

    if(uuid === null){
    file.upload = Upload.upload({
      url: '/upload/pic',
      data: {file: file}
    }).then((response) => {
        file.result = uuid = response.data;
        console.log(uuid);
    }, (response) => {
      if (response.status > 0){
        file.errorMsg = response.status + ': ' + response.data;
      }
    }, (evt) => {
      file.progress = parseInt(100.0 * evt.loaded / evt.total);
      $timeout(function() {
        file.progress = -1;
      },3000);
    });

  }else{
    file.upload = Upload.upload({
      url: '/upload/pic',
      data: {file: file, 'uuid':uuid}
    }).then((response) => {
          file.result = uuid = response.data;
    }, (response) => {
      if (response.status > 0){
        file.errorMsg = response.status + ': ' + response.data;
      }
    }, (evt) => {
      file.progress = parseInt(100.0 * evt.loaded / evt.total);
      $timeout(function() {
        file.progress = -1;
      },3000);
    });
  }
  };

this.uploadData = (form,userid) => {
  var ingredients = [];
  var keys = Object.keys(form.selectedIngr);
  for(var i=0; i<keys.length;i++){
    if (form.selectedIngr[keys[i]] == 'Y')
      ingredients.push(keys[i]);
  };

  // console.log("meal : ",this.selectMeal," cuisine : ",this.selectCuisine);
  var formData = {
    uuid:uuid,
    recipeName: form.recipeName,
    ingredients:ingredients,
    meal_type:form.selectMeal,
    cuisine_type:form.selectCuisine,
    method: form.method,
    time: form.time,
    serves: form.serve,
    taste: form.taste,
    uploader : userid
  };

  console.log(formData);

  $http.post('/upload/data',formData)
  .then((response) => {
    if (response.data.success) {
      this.successMsg = response.data.message;

      $timeout(()=> {
        this.successMsg = null;
        $state.reload();
      },3000);
    }else {
      this.errorMsg = response.data.message;
    }
  });
};

});
