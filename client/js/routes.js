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
      },
      getImages : function($http,$stateParams){
        return $http.get('/images/'+$stateParams.recipeID);
      }
    },
    controller : function($scope,$http,$timeout,$state,getRecipe,getImages) {
      this.recipe = getRecipe.data;
      this.recipe.images = getImages.data.images;
      this.commentSuccess=false;
      this.commentError=false;

      // this.video=false;
      // this.checkVideo=(recipe_name)=>{
      //   console.log("routes checkVideo!!");
      //   $http.post('/checkVideo',{recipe_name:recipe_name})
      //   .then((response)=>{
      //     console.log(response.data.success);
      //     if(response.data.success){
      //       return true;
      //     }else{
      //       return false;
      //     }
      //   });
      // };


      $scope.count=this.recipe.liked_by.length;
      var flag=0;
      //$scope.like=0;
      this.getLikeStatus=(userid)=>{
        console.log(this.recipe.liked_by);
        for(var i=0;i<this.recipe.liked_by.length;i++){
          console.log(i+"  "+this.recipe.liked_by[i]);
          if(this.recipe.liked_by[i]==userid){
            console.log("match found!");
            return flag=1;
          }
          // else{
          //   console.log("match not found!");
          //   return 0;
          // }
        }
      };

      this.recipe.likeFunc=(userid,recipeid)=>{
        // console.log(userid+"  "+recipeid);
        //   console.log("reached in like!");
        $http.post('/recipe/doLike',{recipeID:recipeid,userID:userid})
        .then((response)=>{
          if(response.data.action=="like"){
            $scope.count++;
          }
          else{
            //$scope.like=0;
            $scope.count--;
          }
          $timeout(()=>{
            $state.reload();
          });
          });
        };

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

  .state('resendlink',{
    url:'/resendActivationLink',
    templateUrl:'/views/resend_link.html',
    authenticated:false
  })

  .state('resetlink',{
    url:'/resetLink',
    templateUrl:'/views/reset_link.html',
    authenticated:false
  })

  .state('activate', {
    url : '/activate/:token',
    templateUrl : '/views/activate.html',
    authenticated : false,
    controller : function ($http,$stateParams,$timeout,$state) {

      $http.get('/activate_acc/'+$stateParams.token)
      .then((response)=>{
        if(response.data.success){
          this.successMsg=response.data.message;
          console.log('activated',response.data.message);
          $timeout(()=>{
            $state.go('login');
          },2000);
        }else {
          this.errorMsg=response.data.message;
          console.log('error',response.data.message);
          $timeout(()=>{
            $state.go('resendLink');
          },2000);
        }
      });
        // console.log("Reached in emailCtrl!");
    },
    controllerAs : 'emailCtrl',
  })

  .state('resetPassword', {
    url : '/resetPassword/:token',
    templateUrl : '/views/reset_password.html',
    authenticated : false,
  })

  .state('resendLink', {
    url : '/resendLink',
    templateUrl : '/views/resend_link.html',
    authenticated :false
    })

    .state('resetPasswordLink',{
      url:'/resetPasswordLink',
      templateUrl:'/views/reset_link.html',
      authenticated:false
    })
  // .state('/resend',function(){
  //   url : '/activate/resend',
  //   templateUrl : '/views/resendlink.html',
  //   authenticated : false,
  // })

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
