angular.module('userService',[])
        .factory('User',function($http){
          var userFactory={};

          userFactory.activeAccount=function(token){
            return $http.get('/activate/'+token);
          }

          return userFactory;
        });
