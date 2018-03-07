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


var recipeSchema=new schema({
  "recipe_name" : String,
  "ingredients" : [String],
  "method" : String,
  "likes" : Number,
  "ratings" : Number,
  "comments" : [{"body" : String, "userid" : String}],
  "date" : [{"type" : Date, default : Date.now }],
  "mealtype" : String,
  "cuisinetype" : String,
  "uploader" : String

},{collection:'recipes'});
mongoose.model('recipes',recipeSchema);



var userSchema = new schema({
  "name" : String,
  "userid" : String,
  "password" :String
},{collection:'users'});
userSchema.methods.comparePassword = function(password) {
  return password===this.password;
};
mongoose.model('users',userSchema);



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
