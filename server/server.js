var express = require('express');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var app = express();
let mongoUtil=require('./mongoUtil');
var path=require('path');
var Grid=require('gridfs-stream');
var fs=require('fs');
var mongoose = require('mongoose');

//mongoUtil.connect();

app.use(express.static(__dirname + "/../public"));

app.get('/types', function(request,response){
  mongoose.model('types').find(function(err,types){
    response.send(types);
  });
});

app.get('/meals', function(request,response){
    console.log(mongoose.model('meals').find(function(err,docs) {
      //console.log(meals);
      response.send({meals:docs[0],cuisines:docs[1]});
    }));

});

app.get('/recipes', function(request,response){
    mongoose.model('recipes').find(function(err,recipes){
    //  console.log(recipes);
      response.send(recipes);
    });
});


app.listen(8181,function(){
  console.log("http://localhost:8181");
});
