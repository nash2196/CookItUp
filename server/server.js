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
grid.mongo=mongoose.mongo;



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
    // console.log(recipeID);
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

app.get('/images/:recipeID',function(request,response){

  var gfs=grid(mongoose.connection.db);
  var photo_id;

  var images=[],fTypes=[];
  // console.log("Get Image ");
  recipes.findOne({recipe_name:request.params.recipeID},'photos',function (err,recipe) {
    if (err) {
      console.log("error in finding recipe");
      throw err;
    }
    photo_id = recipe.photos[0];
    console.log(photo_id);

    if (photo_id) {
      gfs.files.find({"metadata.recipeid":photo_id}).toArray(function (err, files) {
        if (err) {
          throw err;
        };

        if(files.length===0){
          return response.json({success : false,message: 'File not found'});
        };
        console.log("File info :",files);
        for (var i = 0; i < files.length; i++) {
          //res.writeHead(200, {'Content-Type': files[0].contentType});
          fTypes.push(files[i].contentType);
          var readstream = gfs.createReadStream({
            filename : files[i].filename
          });

          readstream.on('data', function(data) {
            images.push(
              {
                'data':data.toString('base64'),
                'filetype':fTypes.shift()
              }
            );
          });

          readstream.on('end', function() {
            if (images.length===files.length) {
              // console.log("images ",images);
              // console.log("images:",fTypes);
              response.send({images:images});
              return;
            }
          });

          readstream.on('error', function (err) {
            console.log('An error occurred!');
            throw err;
          });
        };//end for

        // if (error===false) {
        //   console.log("sending image");
        //   response.send({success:true, images : images});
        // }else if(error===true){
        //   console.log("could not send image");
        //   response.send({success:false});
        // }else {
        //   console.log("undefined error");
        // };

      });
    }else {
      console.log("no photo_id");
      response.send({success:false});
    };

  });

  //var length=recipe.length;
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
          var token = jwt.sign({ username : user.name, email : user.userid},secret,{expiresIn : '24h'});
          response.json({success : true, message : 'User authenticated', name : user.name, token : token});
        }
      }
    });

});

app.post('/signup',function(request,response){

  var user=mongoose.model('users');
  var formData=request.body;
  if (formData.pswd!=formData.cpswd) {
    response.json({success : false, message : "Password did'nt matched!"});
  }
  else{
    var userinfo=new user({
      name : formData.name,
      userid : formData.email,
      password : formData.pswd,
    });
    user.findOne({userid:userinfo.userid}).exec(function(err,docs){
      if(docs){
        response.json({success:false,message:"User already exists!"});
      }
      else{
        userinfo.save(function (err,user) {
          if (err) {
            console.log(err);
            response.json({success : false, message : "could not add user"});
          }
          if (user) {
            console.log(user);
            response.json({success : true, message : "User added successfully"});
          }
        });
      }
    });
  }
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

app.get('/details/:userid',function (request,response) {
  var users = mongoose.model('users');
  var findUser = request.params.userid;

  users.findOne({userid:findUser},function (err,user) {
    if (err) {
      throw err;
    }
    if (!user) {
      response.json({success:false, message:"Could not find user info"});
    }else {
      var userinfo = {
        username : user.name,
        description : user.description
      };
      response.json({success:true, info:userinfo});
    };

  });
});

app.post('/upload/pic',multipartMiddleware, function(request,response){
    var uuid = null;
    var gfs=grid(mongoose.connection.db);
    var error;

    if(request.body.uuid===undefined){
      uuid = uuidv4();
    }else{
      uuid = request.body.uuid;
    }

    for (var i = 0; i < request.files.files.length; i++) {
      var file=request.files.files[i].path;
      // console.log(request.files.files[i].headers['content-type']);
      var writestream=gfs.createWriteStream({
         filename : request.files.files[i].originalFilename,
         content_type : request.files.files[i].headers['content-type'],
         metadata : {recipeid:uuid}
      });
      fs.createReadStream(file).pipe(writestream);

      writestream.on('error',function (err) {
        console.log("Error:",err);
        error = true;
        return;
      });
      writestream.on('close',function(file){
        console.log(file.filename+" written to DB");
        error = false;
      });
    };

    if (error===true) {
      response.status(501).send({success:false, message:"could not upload files"});
    }else {
      response.send({success:true, uuid:uuid});
    }

    //console.log("reached here!")
    //var imgPath=path.join(__dirname,'/../client/img/recipe1-img1.jpeg');
    // var file=request.files.file.path;
    // console.log(file);
    // //conn.once('open',function(){
    //   //console.log("inside");
    // var writestream=gfs.createWriteStream({
    //    filename : request.files.file.name,
    //    metadata : {recipeid:uuid}
    // });
    //
    //   fs.createReadStream(file).pipe(writestream);
    //   writestream.on('close',function(file){
    //     console.log(file.filename+" written to DB");
    //   });
    //
    // //
    // // fs.createReadStream(file).pipe(writestream);
    // // writestream.on('close',function(file){
    // //   console.log(file.filename+" written to DB");
    // // });
    // // writeStream.on('close', function() {
    // //   return response.status(200).send({
    // //     message: 'Success'
    // //   });
    // //  });
    //
    //
    // // writeStream.write(file.data);
    // // writeStream.end();
    // response.send(uuid);
});


app.post('/upload/data',function(request,response){

  var formData = request.body;
  if (formData.uuid == null || formData.uuid == '') {
    response.json({success : false, message : "Attach atleast one image/video"});
  }else{
    var recipe = new recipes({
      recipe_name : formData.recipeName,
      ingredients : formData.ingredients,
      method : formData.method,
      likes : 0,
      ratings : 0,
      comments : [],
      photos : [formData.uuid],
      videos : [formData.uuid],
      date : "",
      mealtype : formData.meal_type,
      cuisinetype : formData.cuisine_type,
      uploader : formData.uploader
    });

    recipe.save(function (err,recipe) {
      if (err) {
        console.log(err);
        response.json({success : false, message : "could not add recipe"});
      }
      if (recipe) {
        console.log(recipe);
        response.json({success : true, message : "Recipe uploaded successfully"});
      }else {
        console.log("no docs affected");
        response.json({success : false, message : "could not add recipe"});
      }
    });
  }
  // console.log(formData);
  // formData.save()
  // .then(console.log("recipe saved!"));
  //.catch(console.log("failed to save recipe!"));
  //console.log("Name: ",formData.recipeName);
  //console.log("ingredients: ",formData.ingredients);
  //console.log("meal_type: ",formData.meal_type," cuisine_type: ",formData.cuisine_type);
  // response.send(formData.uuid);

});

app.post('/upload/profilePic',multipartMiddleware,function (request,response) {
  var uuid = uuidv4();
  var gfs=grid(mongoose.connection.db);
  var user = mongoose.model('users');
  var file=request.files.file.path;
  var userid = request.body.userid;
  // console.log(file);
  var writestream=gfs.createWriteStream({
     filename : request.files.file.originalFilename,
     metadata : {profileID:uuid}
  });
  fs.createReadStream(file).pipe(writestream);

  writestream.on('error',function (err) {
    console.log("Error:",err);
    response.json({success:false, message:'Could not upload image'});
  });
  writestream.on('close',function(file){
    console.log(file.filename+" written to DB");
    user.findOneAndUpdate({userid:userid}, {$set : {"profile_picture" : uuid}},function (err,changed) {
      if (err) {
        console.log("Error:",err);
        response.json({success : false, message : 'Could not add profile picture'});
      }else {
        console.log("Changed user : ",changed);
        response.json({success:true, message:'Updated profile picture'});
      };
    });
    // response.json({success:true, uuid:uuid});
  });
});


app.post('/upload/profileData',function (request,response) {
  var user = mongoose.model('users');
  var formData=request.body;
  var error=false;
  user.findOne({userid:formData.userID}).exec(function (err,user) {
    if (err) {
      console.log("Error: ",err);
      response.json({success:false, message:"Could not update user info"});
    }

    if(!user){
      response.json({success:false, message:"Could not update user info"});
    }else if(user) {
      if (formData.name!=null && formData.name!='' && formData.name!=undefined) user.name=formData.name;
      if (formData.description!=null && formData.description!='' && formData.description!=undefined) user.description=formData.description;
      if (formData.curpswd) {
        var validPswd = user.comparePassword(formData.curpswd);
        if (!validPswd) {
          response.json({success:false, message:'Incorrect current password'});
          error=true;
        }else {
          if (formData.newpswd!=formData.cnfrmpswd) {
            response.json({success:false, message:'Passwords dont match!'});
            error=true;
          }else {
            user.password=formData.newpswd;
          }//end else
        }//end else
      }//end if
      if (!error) {
        user.save(function (err,user) {
          if (err) {
            response.json({success:false, message:"Could not update user info"});
          }else {
            response.json({success:true, message:"Updated user info"});
          }
        });
      }
    }//end elseif
  });
});




app.listen(8181,function(){
  console.log("http://localhost:8181");
});
