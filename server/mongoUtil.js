"use strict";
var mongoose = require('mongoose');
var schema=mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/cookitup');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: Failed to connect with MongoDB'));
db.once('open', function() {
  console.log("Connected to MongoDB...");
});

var ingredients = new schema({
//  "_id": schema.ObjectID,
  "options": [{"ingredient_name": String, "recipe_used":[]}],
  "type": String
},{collection:'ingredients'});
mongoose.model('types', ingredients);

var mealCuisineType=new schema({},{collection:'mealcuisinetype'});
mongoose.model('meals', mealCuisineType);

var recipes=new schema({},{collection:'recipes'});
mongoose.model('recipes',recipes);
  //ingredient.methods.findAll = function(cb) {
//  return this.model('ingredient').find(, cb);
//};

// module.exports={
//   connect(){
//     client.connect('mongodb://localhost:27017/cookitup',(err,db)=>{
//       if(err){
//         console.log("Error connecting to MongoDB!");
//         process.exit(1);
//       }
//         _db=db;
//         console.log("Connected to Mongo...");
//     });
//   },
//   recipes(){
//     return _db.collection('recipes');
//   },
//   users(){
//     return _db.collection('users');
//   },
//   ingredients(){
//     return _db.collection('ingredients');
//   },
//   mealtypes(){
//     return _db.collection('mealtypes');
//   },
//   cuisinetypes(){
//     return _db.collection('cuisinetypes');
//   },
//   mealcuisinetype(){
//     return _db.collection('mealcuisinetype');
//   }
// }