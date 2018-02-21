var express = require('express');
var session = require('express-session')
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var uuidv4 = require('uuid/v4');
var multipartMiddleware = multipart();
var app = express();

app.use(express.static(__dirname + "/client"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret:'abcdefgh1234',
  resave: false,
  saveUninitialized: true}));


var _session;
var loggedIn = false;

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
