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

//var fs.files=new schema({},{collection:'fs.files'});
var FileSchema = new schema({}, { collection: 'fs.files' });
var fsfile = mongoose.model('fsfile', FileSchema);

var recipeSchema=new schema({
  //"_id": schema.Types.ObjectID,
  "recipe_id": String,
  "recipe_name" : String,
  "ingredients" : [String],
  "method" : String,
  "ratings" : Number,
  "comments" : [{"body" : String, "userid" : String}],
  "photos" : [String],
  "videos" : [String],
  "date" : String,
  "mealtype" : String,
  "cuisinetype" : String,
  "uploader" : String,
  "taste":String,
  "other_ingre":String,
  "serves":Number,
  "time":String,
  "thumbnail":[],
  "liked_by":[],
  "gridfs_id":{ type: schema.Types.ObjectId, ref:'fsfile' }
},{collection:'recipes'});
mongoose.model('recipes',recipeSchema);


var userSchema = new schema({
  "name" : String,
  "userid" : String,
  "password" :String,
  "recipes_uploaded":[],
  "saved_recipes":[],
  "profile_picture":String,
  "description":String,
  "active": {type:Boolean, required:true, default:false} ,
  "temporaryToken":{type:String, required:false}

},{collection:'users'});
userSchema.methods.comparePassword = function(password) {
  return password===this.password;
};
mongoose.model('users',userSchema);
