var express = require('express');
var session = require('express-session')
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var uuidv4 = require('uuid/v4');
var multipartMiddleware = multipart();
var app = express();
let mongoUtil=require('./mongoUtil');
var path=require('path');
var fs=require('fs');
var mongoose = require('mongoose');

app.use(express.static(path.join(__dirname, '/../client')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret:'abcdefgh1234',
  resave: false,
  saveUninitialized: true}));


var _session;
var loggedIn = false;

app.get('/types', function(request,response){
  mongoose.model('types').find(function(err,types){
    response.send(types);
  });
});


app.get('/meals', function(request,response){
    mongoose.model('meals').find(function(err,docs) {
      response.send({meals:docs[0],cuisines:docs[1]});
  });
});

app.get('/recipes', function(request,response){
    mongoose.model('recipes').find(function(err,recipes){
      console.log(recipes);
      response.send(recipes);
    });
});


app.get('/recipe/:recipeID', function(request,response) {
    var recipeID = request.params.recipeID;
    console.log(recipeID);
    mongoose.model('recipes').findOne({recipe_name : recipeID},function(err,recipe){
      if(err){
        response.status(404).send("Not found");
      }
      response.send(recipe);
    });

  //   for(i=0 ; i<recipes.length;i++) {
  //     console.log("recipeID search param ",recipes[i].id);
  //     if(recipes[i].id === recipeID){
  //         response.send(recipes[i]);
  //         break;
  //     }else{
  //       if(i==recipes.length) response.status(404).send("Not found");
  //   }
  // };

});


app.get('/login',function(request,response){
  console.log("GET recieved");
  if(loggedIn===true){
    var username = _session.name;
    response.status(200).send(username);
  }else{
    response.status(400).send("Error");
  }
});

app.post('/login',function(request,response){
      console.log("POST recieved");
    _session = request.session;

    console.log(request.body);
    if(request.body.pswd==='1'){
      _session.name = request.body.email;
      loggedIn = true;
      response.status(200).send("Success");
    }else{
      loggedIn = false;
      response.status(400).send("Error");
    }

});


app.post('/upload/pic',multipartMiddleware, function(request,response){
    var uuid = null;

    if(request.body.uuid===undefined){
      var file = request.files.file;
      uuid = uuidv4();
      console.log(file.name);
      console.log(file.type);
      console.log(file.path);
      console.log("generated: ",uuid);
      response.send(uuid);
  }else{
    var file = request.files.file;
    uuid = request.body.uuid;
    console.log(file.name);
    console.log(file.type);
    console.log(file.path);
    console.log("from request: ",request.body.uuid);
    response.send(uuid);
  }
});

app.post('/upload/data',function(request,response){

  var formData = request.body;
  console.log("Name: ",formData.recipeName);
  console.log("ingredients: ",formData.ingredients);
  console.log("meal_type: ",formData.meal_type," cuisine_type: ",formData.cuisine_type);
  response.send(formData.uuid);

});

app.listen(8181,function(){
  console.log("http://localhost:8181");
});
