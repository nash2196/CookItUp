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
    var file = request.files.file;
    console.log(file.name);
    console.log(file.type);
    console.log(file.path);
    response.send("Success");
});

app.listen(8181,function(){
  console.log("http://localhost:8181");
});
