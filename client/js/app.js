var app = angular.module('MainApp',['ngFileUpload','routes','ValueService','AuthService']);

app.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptors');
});

app.controller('MainController',function(authService,$timeout,$state,$transitions,$http,$scope,$stateParams){

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
      this.userid = null;
    };

  });

  this.doLogin =  (formData) => {
    this.errorMsg = false;
    this.expired=false;
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
        if(response.data.expired)
        {
          this.expired=true;
        }
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

  this.addToFav=(recipeId,userId)=>{
    this.successMsg=null;
    this.errorMsg=null;
  //  console.log("Reached in favCtrl");
    var details={
      recipeId : recipeId,
      userId : userId
    };
    //console.log(details);
    $http.post('/addFav',details)
    .then((response) => {
      if (response.data.success) {
        this.successMsg = response.data.message;
      }else {
        this.errorMsg = response.data.message;
      }
    });
  };

  this.removeFav=(recipeId,userId)=>{
    this.successMsg=null;
    this.errorMsg=null;
    console.log("remove recipe app.js");
    console.log(recipeId+"  "+userId);
    var details={
      recipeId:recipeId,
      userId:userId
    };
    $http.post('/removeFav',details)
    .then((response)=>{
      if (response.data.success) {
        $state.reload();
      }
    });
  };

  this.removeRecipe=(recipeId,userId)=>{
    this.successMsg=null;
    this.errorMsg=null;
    console.log("remove fav app.js");
    console.log(recipeId+"  "+userId);
    var details={
      recipeId:recipeId,
      userId:userId
    };
    $http.post('/removeRecipe',details)
    .then((response)=>{
      if (response.data.success) {
        $state.reload();
      }
    });
  };

  this.resendLink=(formData)=>{
    this.resendErrorMsg = false;
    this.resendSuccessMsg=false;
    this.expired=false;

    var formData = {
          email : formData.uname,
          pswd : formData.pswd
    };
    $http.post('/resend',formData)
    .then((response)=>{
      if(response.data.success){
        this.resendSuccessMsg=response.data.message;
        console.log('Link sent',response.data.message);
        $timeout(()=>{
          $state.go('login');
        },2000);
      }else {
        if(response.data.active){
          console.log("This account is already account!")
          this.resendSuccessMsg=response.data.message;
          $timeout(()=>{
            $state.go('login');
          },2000);
        }
        else{
          this.resendErrorMsg=response.data.message;
          console.log('error',response.data.message);
        }
      }
    });
  };


  this.resetPasswordLink=(formData)=>{
    this.resetErrorMsg = false;
    this.resetSuccessMsg=false;
    $http.post('/resetPasswordLink',formData).then((response)=>{
        if(response.data.success){
          this.resetSuccessMsg=response.data.message;
          $timeout(()=>{
            $state.go('login');
          },4000);
        }else {
          this.resetErrorMsg=response.data.message;
          console.log('error',response.data.message);
          // $timeout(()=>{
          //   $state.go('resendLink');
          // },4000);
        }
      });
    };

    this.resetPassword=(formData)=>{
      this.resetPasswordSuccessMsg=false;
      this.resetPasswordErrorMsg=false;
      console.log(formData.pswd);

      if(formData.pswd==formData.cpswd){

      $http.get('/resetPassword/'+$stateParams.token).then((response)=>{

          if(response.data.success){
            var details={
              userid:response.data.userid,
              password:formData.pswd
            };
            $http.post('/resetPassword',details).then((response)=>{
              if(response.data.success){
                this.resetPasswordSuccessMsg=response.data.message;
                $timeout(()=>{
                  $state.go('login');
                },4000);
              }else{
                this.resetPasswordErrorMsg=response.data.message;
              }
            });

          }else {
            this.resetPasswordErrorMsg=response.data.message;
            console.log('error',response.data.message);
            // $timeout(()=>{
            //   $state.go('resendLink');
            // },4000);
          }
        });
      }else{
        this.resetPasswordErrorMsg="Passwords did'nt matched!";
      }
    }

});




app.controller('ProfileController',function ($http,authService) {
  authService.getUser().then((response) => {
    this.successMsg=null;
    this.errorMsg=null;
    this.userid = response.data.email;
    $http.get('/details/'+this.userid)
    .then((response)=>{
      if (response.data.success) {
        this.userInfo = response.data.info;
        console.log(this.userInfo.username);
      }else {
        this.errorMsg = response.data.message;
      };
    });
  });
});


// app.controller('HeaderController',function($stateParams,authService){
//   this.loggedIn = $stateParams;
//   console.log("headCtrl login: ",this.loggedIn);
// });

app.controller('SignupController',function($state,$http,$timeout){

  this.errorMsg=false;
  this.successMsg=false;
  this.doSignup = (formData) =>{

    var formData={
      email:formData.email,
      name: formData.uname,
      pswd:formData.pswd,
      cpswd:formData.cpswd,
    };

    $http.post('/signup',formData)
    .then((response) => {
      console.log("reached in http post!");
      if (response.data.success) {
        this.successMsg = response.data.message+"...Redirecting...";

        $timeout(()=>{
            $state.go('login');
            this.successMsg = null;
        },2000);

      }else {
        this.errorMsg = response.data.message;
      }
    });
    // if(pswd==cpswd){
    //   alert("SignUp Successfull!");
    // }
    // else{
    //   alert("Password did'nt matched!")
    // }
  };
});

app.controller('ProfileController',function ($http,authService) {
  authService.getUser().then((response) => {
    this.successMsg=null;
    this.errorMsg=null;
    this.userid = response.data.email;
    $http.get('/details/'+this.userid)
    .then((response)=>{
      if (response.data.success) {
        this.userInfo = response.data.info;
        console.log(this.userInfo.username);
      }else {
        this.errorMsg = response.data.message;
      };
    });
  });
});
app.controller('EditProfileController',function (Upload,$http,$timeout,$state,authService) {

  authService.getUser().then((response) => {
    this.successMsg=null;
    this.errorMsg=null;
    this.userid = response.data.email;
    $http.get('/details/'+this.userid)
    .then((response)=>{
      if (response.data.success) {
        this.userInfo = response.data.info;
        console.log(this.userInfo);
      }else {
        this.errorMsg = response.data.message;
      };
    });
  });

  var uuid = null;
  this.doEdit = (formData,userid)=>{
    this.successMsg=null;
    this.errorMsg=null;
    var userInfo = {
      userID : userid,
      name : formData.name,
      curpswd : formData.curpswd,
      newpswd : formData.newpswd,
      cnfrmpswd : formData.cnfrmpswd,
      description : formData.description
    };

    $http.post('/upload/profileData',userInfo)
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

  // this.removeProPic=(userId)=>{
  //   this.userid=userId
  //   $http.post('/removeProPic',this.userId).then((response)=>{
  //     this.removedPicMsg=response.data.message;
  //   });
  // }

  this.uploadPic = (file,userid) => {
    file.upload = Upload.upload({
      url : '/upload/profilePic',
      data : {file : file, userid : userid}
    }).then((response) => {
      file.result = response.data.message;
      console.log(file.result);
    }, (response) => {
      if (response.status > 0){
        file.errorMsg = response.status + ': ' + response.data.message;
      }
    }, (evt) => {
      file.progress = parseInt(100.0 * evt.loaded / evt.total);
      $timeout(function() {
        file.progress = -1;
      },3000);
    });
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

app.controller('uploadedRecipesCtrl',function($http,authService){
  authService.getUser().then((response) => {
    this.userid = response.data.email;
  //  this.favRecipes=[];
//    console.log("auth"+this.userid);
    $http.get('/uploadedRecipes/'+this.userid).then((response)=>{
      this.uploadedRecipes=response.data;
      console.log("uploadedRecipesCtrl: "+this.uploadedRecipes);
    });
  });
});


app.controller('favController',function($http,authService){
  authService.getUser().then((response) => {

    this.userid = response.data.email;
  //  this.favRecipes=[];
    console.log("auth"+this.userid);
    $http.get('/favRecipes/'+this.userid).then((response)=>{
      this.favRecipes=response.data;
      console.log("favCtrl: "+this.favRecipes);
    });
  });
});

app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});

app.controller('RecipeController',function($http, valueService){

  $http.get('/recipes').then((response)=>{
    this.recipes = response.data;
  });


  this.searchRecipe = (keyword=undefined) => {

    if(keyword!=undefined){
      console.log(keyword);
      this.keyword=keyword;
      this.selectedRecipe=this.recipes;
      //console.log(this.selectedRecipe);
      return this.selectedRecipe;
    }else{

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
  }
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

  this.uploadPic = (files) => {
    // console.log(files," type:",files[0].type);
    if (files && files.length){
      if(uuid === null){
        files.upload = Upload.upload({
          url: '/upload/pic',
          data: {files: files}
        });
      }else {
        files.upload = Upload.upload({
          url:'/upload/pic',
          data: {files: files, uuid:uuid}
        });
      };

      files.upload.then((response) => {
        files.result = uuid = response.data.uuid;
        console.log(uuid);
      }, (response) => {
        if (response.status > 0){
          files.errorMsg = response.status + ': ' + response.data.message;
        }
      }, (evt) => {
        files.progress = parseInt(100.0 * evt.loaded / evt.total);
        $timeout(function() {
          files.progress = -1;
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
    serves: form.serves,
    taste: form.taste,
    uploader : userid,
    other_ingre:form.other_ingre,
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
