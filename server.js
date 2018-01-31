var express = require('express');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var app = express();

app.use(express.static(__dirname + "/public"));

app.get('/types', function(request,response){
  var types = [
    {name:'Dairy', options: ['Milk','Butter','Cheese']},
    {name:'Vegetables', options: ['Onion','Tomato','Garlic']},
    {name:'Fruits', options: ['Banana','Apple','Orange']}
  ];
  response.send(types);
});


app.get('/meals', function(request,response){
    var meal_type = ['Breakfast','Lunch','Dinner'];
    var cuisine_type = ['Indian','Italian','Mexican'];

  response.send({meals:meal_type , cuisines:cuisine_type});
});


app.post('/upload/pic',multipartMiddleware, function(request,response){
    var file = request.files.file;
    console.log(file.name);
    console.log(file.type);
    console.log(file.path);
    response.send("Success");
});

app.listen(8181,function(){
  console.log("http://localhost:8181");
});
