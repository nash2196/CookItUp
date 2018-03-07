var express = require('express');
var session = require('express-session')
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var uuidv4 = require('uuid/v4');
var multipartMiddleware = multipart();
var app = express();
let mongoUtil=require('./mongoUtil');
var path=require('path');
var fs=require('fs');
var mongoose = require('mongoose');
var grid=require('gridfs-stream');
var recipes=mongoose.model('recipes');


app.use(express.static(path.join(__dirname, '/../client')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(session({
//   secret:'abcdefgh1234',
//   resave: false,
//   saveUninitialized: true}));


var secret = "cookitup";
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
    recipes.find(function(err,recipes){
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
});

app.post('/recipe/comment',function (request,response) {
    var recipeID = request.body.recipeID;
    var comment = request.body.comment;
    var userid = request.body.userID;

    if(recipeID == null || recipeID == '' || userid == null || userid == '' || comment == null || comment == ''){
      console.log("Something undefined ",recipeID,userid,comment);
      response.json({success : false});
    }else {
      console.log("Trying to write ");
      mongoose.model('recipes').findOneAndUpdate({"recipe_name":recipeID},{$push : {"comments" : {"body" : comment, "userid" : userid}}},{returnNewDocument: true},
      function (err,changed) {
        if (err){
          console.log("error : ",err);
          response.json({success : false});
        }else {
          console.log("changed : ",changed);
          response.json({success : true});
        }
      });

    }
});

app.post('/login',function(request,response){

    var user = mongoose.model('users');

    console.log("POST recieved");
    console.log(request.body);

    user.findOne({userid : request.body.email}).select('name userid password').exec(function(err,user) {
      if(err) throw err;

      if(!user){
        response.json({success : false, message : 'No user found'});
      }else if(user){
        var validPswd = user.comparePassword(request.body.pswd);
        if(!validPswd){
          response.json({success : false, message : 'Invalid password'});
        }else{
          var token = jwt.sign({ username : user.name, email : user.userid},secret,{expiresIn : '1h'});
          response.json({success : true, message : 'User authenticated', name : user.name, token : token});
        }
      }
    });

});


app.use(function(request,response,next) {
  var token = request.body.token || request.body.query || request.headers['x-access-token'];

  if(token){
    jwt.verify(token, secret, function (err,decoded) {
      if (err) {
        response.json({success : false, message : "Token invalid"});
      }else {
        request.decoded = decoded;
        next();
      };
    });
  }else{
    response.json({success:false, message : "No token recieved"});
  }
});

app.post('/user',function (request,response) {
  response.send(request.decoded);
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
  formData.save()
  .then(console.log("recipe saved!"));
  //.catch(console.log("failed to save recipe!"));
  //console.log("Name: ",formData.recipeName);
  //console.log("ingredients: ",formData.ingredients);
  //console.log("meal_type: ",formData.meal_type," cuisine_type: ",formData.cuisine_type);
  response.send(formData.uuid);

});

app.listen(8181,function(){
  console.log("http://localhost:8181");
});



app.get('/images',function(request,response){
  var photos=recipes.find({_id:request.body},{photos:true,_id:false});
  console.log(recipe);
  //var length=recipe.length;
  var images;
  for (var i = 0; i < photos.length; i++) {
    gfs.files.find({ _id:photos[i] }).toArray(function (err, files) {
   	    if(files.length===0){
  			return res.status(400).send({
  				message: 'File not found'
  			});
      }

      //res.writeHead(200, {'Content-Type': files[0].contentType});

  		var readstream = gfs.createReadStream({
  			  //filename: files[0].filename
  		});

  	    readstream.on('data', function(data) {
  	        images[i]=write(data);
  	    });

  	    readstream.on('end', function() {
  	      //  res.end();
  	    });

  		readstream.on('error', function (err) {
  		  console.log('An error occurred!', err);
  		  throw err;
  		});
  	});
  }
  response.send(images);
});

app.post('/upload/pic',multipartMiddleware, function(request,response){
    var uuid = null;
    if(request.body.uuid===undefined){
      //var file = request.files.file;
      uuid = uuidv4();

      //console.log(file.name);
      //console.log(file.type);
      //console.log(file.path);
      //console.log("generated: ",uuid);
      //response.send(uuid);
    }else{
    //var file = request.files.file;
      uuid = request.body.uuid;
      //console.log(file.name);
      ///console.log(file.type);
    //  console.log(file.path);
      //console.log("from request: ",request.body.uuid);//
    //  response.send(uuid);
    }
      //console.log("reached here!")
    //var imgPath=path.join(__dirname,'/../client/img/recipe1-img1.jpeg');
    var file=request.files.file.path;
    console.log(file);
    //conn.once('open',function(){
      //console.log("inside");
       grid.mongo=mongoose.mongo;
       var gfs=grid(conn.db);
       var writestream=gfs.createWriteStream();

      fs.createReadStream(file).pipe(writestream);
      writestream.on('close',function(){
        console.log(" written to DB");
      });

    //
    // fs.createReadStream(file).pipe(writestream);
    // writestream.on('close',function(file){
    //   console.log(file.filename+" written to DB");
    // });
    // writeStream.on('close', function() {
    //   return response.status(200).send({
    //     message: 'Success'
    //   });
    //  });


    // writeStream.write(file.data);
    // writeStream.end();
    response.send(uuid);
});
