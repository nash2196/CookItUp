var express = require('express');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var uuidv4 = require('uuid/v4');
var multipartMiddleware = multipart();
var app = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

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

app.get('/recipes', function(request,response){

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

  response.send(recipes);
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
  console.log(formData.recipeName);
  response.send(formData.uuid);

});

app.listen(8181,function(){
  console.log("http://localhost:8181");
});
