var app = angular.module('AuthService',[]);

app.service('authService',function($http,authTokenService){

  var authService = {};

  authService.login = (userData) => {
    return $http.post('/login',userData).then(function(response) {
      authTokenService.setToken(response.data.token);
      return response;
    });
  };

  authService.isLoggedIn = function() {
    if(authTokenService.getToken()){
      return true;
    }else{
      return false;
    }
  };

  authService.getUser = function () {
    if (authTokenService.getToken()) {
      return $http.post('/user');
    }else {
      $q.reject({message : "User has no token"});
    }
  };

  authService.logout = function () {
    authTokenService.setToken();
  }

  return authService;
});

app.service('authTokenService',function($window){
  var authTokenService ={};

  authTokenService.setToken = function(token) {
    if (token) {
      $window.localStorage.setItem('token',token);
    }else{
      $window.localStorage.removeItem('token');
    }

  };

  authTokenService.getToken = function() {
    return $window.localStorage.getItem('token');
  };

  return authTokenService;
});

app.service('authInterceptors',function (authTokenService) {
  var authInterceptors = {};

  authInterceptors.request = function (config) {
    var token = authTokenService.getToken();

    if(token){
      config.headers['x-access-token'] = token;
    }

    return config;
  };
  return authInterceptors;
});
