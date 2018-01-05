var express = require('express');
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


app.listen(8181,function(){
  console.log("http://localhost:8181");
});
