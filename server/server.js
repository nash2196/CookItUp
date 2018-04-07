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
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
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
      //console.log(recipes);
      response.send(recipes);
    });
});


//get recipes with images
// app.get('/recipes', function(request,response){
//     recipes.find({}).populate('gridfs_id').exec(function(err,recipes){
//     //  console.log(recipes);
//       var gfs=grid(mongoose.connection.db);
//       if (err) {
//         console.log("error in finding recipe");
//         throw err;
//       }
//       //var photo_id;
//     for(var i=0;i<recipes.length;i++){
//       (function(i){
//       var thumbnail=[],fTypes=[];
//       // console.log("Get Image ");
//       //recipes.findOne({recipe_name:request.params.recipeID},'photos',function (err,recipe) {
//         //console.log(photo_id);
//
//         if (recipes[i].photos[0]) {
//           //gfs.files.find({"metadata.recipeid":photo_id}).toArray(function (err, files) {
//             //if (err) {
//             //  throw err;
//             //};
//
//             // if(files.length===0){
//             //   return response.json({success : false,message: 'File not found'});
//             // };
//
//             console.log(i+" : "+recipes[i].recipe_name);
//  //            gfs.exist({_id: recipes[i].gridfs_id}, function (err, found) {
//  // if (err) return handleError(err);
//  // found ? console.log('File exists') : console.log('File does not exist');
//  //res.send(found)
// //});
//             //console.log("File info :",files);
//             //for (var i = 0; i < files.length; i++) {
//               //res.writeHead(200, {'Content-Type': files[0].contentType});
//               fTypes.push(recipes[i].gridfs_id.contentType);
//               console.log("ftypes "+i+" "+ftypes );
//               var readstream = gfs.createReadStream({
//                 filename : recipes[i].gridfs_id.filename
//               });
//               console.log("filename: "+recipes[i].gridfs_id.filename);
//
//               readstream.on('data', function(data) {
//                 thumbnail.push(
//                   {
//                     'data':data.toString('base64'),
//                     'filetype':fTypes.shift()
//                   }
//                 );
//               });
//
//               readstream.on('end', function() {
//                 // if (recipes[i].thumbnail.length===1) {
//                 //   // console.log("images ",images);
//                 //   // console.log("images:",fTypes);
//                 //   //response.send({images:images});
//                 //   console.log("finished!");
//                   return;
//               });
//
//               readstream.on('error', function (err) {
//                 console.log('An error occurred!');
//                 throw err;
//               });
//             //};//end for
//           }
//         else {
//           console.log("no photo_id");
//           response.send({success:false});
//         }
//       })(i);
//     }
//     });
// });


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


app.get('/uploadedRecipes/:userid',function(request,response){
  //var uploadedRecipes=[];
  recipes.find({"uploader":request.params.userid}).exec(function(err,uploadedRecipes){
    if(err){
      throw err;
    }else{
      if(!uploadedRecipes){
        response.send({success:false, message:'No uploaded recipes to display.'});
      }else{
        response.send(uploadedRecipes);
      }
    }
  });
});


app.get('/favRecipes/:userid',function(request,response){
//  console.log("In app.js "+request.params.userid);
    var favouriteRecipes=[];
  var user = mongoose.model('users');

  user.findOne({userid : request.params.userid}).select('saved_recipes').exec(function(err,user){

    for(var i=0;i<user.saved_recipes.length;i++){
      //console.log(i);
      recipes.findOne({"recipe_id":user.saved_recipes[i]},(function(i){
        return function(err,recipe){
                favouriteRecipes.push(recipe);
              //  console.log(i);
                //console.log(i+" loop: "+favouriteRecipes[i]);
                if((i+1)==user.saved_recipes.length){
                //  console.log("In if condition: "+favouriteRecipes);
                  response.send(favouriteRecipes);
                //console.log(recipe);
              }
            }
          }) (i));
      }
      });
});

  // var favouriteRecipes=[];
  // for(var i=0;i<request.body;i++){
  //   recipes.findOne({"recipe_id":request.body[i]},function(err,recipe){
  //     favouriteRecipes.push(recipe);
  //   });
  // }
//   response.json(favouriteRecipes);
// });

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
//    console.log(photo_id);

    if (photo_id) {
      gfs.files.find({"metadata.recipeid":photo_id}).toArray(function (err, files) {
        if (err) {
          throw err;
        };

        if(files.length===0){
          return response.json({success : false,message: 'File not found'});
        };
  //      console.log("File info :",files);
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

    user.findOne({userid : request.body.email}).select('name userid password active').exec(function(err,user) {
      if(err) throw err;

      if(!user){
        response.json({success : false, message : 'No user found'});
      }else if(user){
        var validPswd = user.comparePassword(request.body.pswd);
        if(!validPswd){
          response.json({success : false, message : 'Invalid password'});
        }else if (!user.active) {
            response.json({success:false, message:'Account is not yet activated. Please check you email for the activation link.',expired:true});
        }else{
          var token = jwt.sign({ username : user.name, email : user.userid},secret,{expiresIn : '24h'});
          response.json({success : true, message : 'User authenticated', name : user.name, token : token});
        }
      }
    });

});

app.post('/signup',function(request,response){
  //console.log("reachedhere!");
  var options = {
    auth: {
      api_user: 'cookitup-project',
      api_key: 'cookitup123'
    }
  };

  var client = nodemailer.createTransport(sgTransport(options));

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
      profile_picture:"default",
      temporaryToken:jwt.sign({ username : formData.name, email : formData.userid},secret,{expiresIn : '24h'})
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
            //console.log(user);

            var email = {
              from: 'Cookitup.com, cookitup@localhost.com',
              to: user.userid,
              subject: 'Cookitup: Activation link',
              text: 'Hello '+user.name+', thank you for joining Cookitup. Please click on the following link to activate your Cookitup account: http://localhost:8181/activate/'+user.temporaryToken,
              html: 'Hello<strong> '+user.name+'</strong>,<br/><br/>Thank you for joining Cookitup.<br/>Please click on the link below to activate your Cookitup account:<br/></br><a href="http://localhost:8181/activate/'+user.temporaryToken+'">http//localhost:8181/activate/</a>'
            };

            client.sendMail(email, function(err, info){
                if (err ){
                  console.log(err);
                }
                else {
                  console.log('Message sent: ' + info.response);
                }
            });

            response.json({success : true, message : "Account registered! Please check your email for activation link."});
          }
        });
      }
    });
  }
});

app.get('/activate/:token',function(request,response){
  console.log("reachedhere");
  var user = mongoose.model('users');
  user.findOne({temporaryToken:request.params.token},function(error,user){
    if(error) throw error;
    var token=request.params.token;


    var options = {
      auth: {
        api_user: 'cookitup-project',
        api_key: 'cookitup123'
      }
    };

    var client = nodemailer.createTransport(sgTransport(options));

    jwt.verify(token, secret, function (err,decoded) {
      if (err) {
        response.sendFile(path.join(__dirname + '/../client/views/activate.html'));
        // response.json({success : false, message : "Activation link has expired"});
      }else if(!user){
        response.json({success : false, message : "Activation link has expired"});
      } else {
        user.temporaryToken=false;
        user.active=true;
        user.save(function(error){
          if(error){
            console.log(error);
          }else{

            var email = {
              from: 'Cookitup.com, cookitup@localhost.com',
              to: user.userid,
              subject: 'Cookitup: Acount activated.',
              text: 'Hello '+user.name+', Your account has been activated.',
              html: 'Hello<strong> '+user.name+'</strong>,<br/><br/>Your account has been activated.'
            };

            client.sendMail(email, function(err, info){
                if (err ){
                  console.log(err);
                }
                else {
                  console.log('Message sent: ' + info.response);
                }
            });
            //response.send({success : true, message : "Account activated!"});
            response.sendFile(path.join(__dirname + '/../client/views/activate.html'));
          }
        });
      };
    });
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

// app.post('/removeProPic',function(request,response){
//   console.log(request.body);
//   var users=mongoose.model('users');
//   users.findOneAndUpdate({"userid":request.body},{$set:{"profile_picture":"default"}}).exec(function(err,changed){
//     if(err){
//       throw error;
//     }
//     if(changed){
//         response.json({message:"Current profile picture removed"});
//     }
//   });
// });

app.post('/recipe/doLike',function(request,response){
  var userid=request.body.userID;
  var recipeid=request.body.recipeID;
  //console.log(request.body.recipeID+" "+request.body.userID);
  recipes.findOne({"recipe_id":recipeid},function(err,recipe){
    if(err){
      throw err;
    }
    if(recipe){
    var flag=0;
    var i;
    console.log(recipe);
    console.log("liked_by: "+recipe.liked_by.length);

    for(i=0;i<recipe.liked_by.length;i++)
    {
      if(recipe.liked_by[i]==userid){
        flag=1;
        break;
      }
    }
    console.log(flag);
    if(flag==1){
      recipe.liked_by.splice(i,1);
      console.log(recipe.liked_by);
      recipe.save(function(err){
        if(err){
          throw err;
        }
        else {
         response.json({action:"unlike"});
        }
      });
    }
    else{
      recipe.liked_by.push(request.body.userID);
      console.log(recipe.liked_by);
      recipe.save(function(error){
        if(error){
          throw error;
        }
        else{
          response.json({action:"like"});
        }
      });
    }
  }
  });
});

app.post('/removeRecipe',function(request,response){
  var users=mongoose.model('users');
  var recipeId=request.body.recipeId;
  var userId=request.body.userId;
  //console.log(recipeId+"  "+userId);
  recipes.findOneAndRemove({"recipe_id":recipeId},function(err,changed) {
    if (err) {
      throw err;
    }else {
      if(changed){
        console.log("Removed from recipes"+changed);
        response.json({success:true, message:'Recipe removed!'});
      }
      else{
        response.json({success:true, message:'Recipe is already removed!'});
      }
    }
  });
});


app.post('/removeFav',function(request,response){
  var users=mongoose.model('users');
  var recipeId=request.body.recipeId;
  var userId=request.body.userId;
  //console.log(recipeId+"  "+userId);
  users.findOneAndUpdate({"userid":userId},{$pull:{"saved_recipes":recipeId}},function (err,changed) {
    if (err) {
      throw err;
    }else {
      if(changed){
        console.log("Removed from favourites");
        response.json({success:true, message:'Removed from favourites'});
      }
      else{
        console.log("Already removed from favourites. ");
        response.json({success:true, message:'Already removed from favourites'});
      }
    }
  });
});

app.post('/addFav',function (request,response){
  var flag=0;
  var users = mongoose.model('users');
  var recipeId=request.body.recipeId;
  var userId=request.body.userId;

  users.findOne({userid:userId},function (err,user) {
    //console.log(userId,user);
    for(var i=0;i<user.saved_recipes.length;i++)
    {
      if(user.saved_recipes[i]===recipeId){
        flag=1;
        break;
      }
    }
    if(flag==1){
      response.json({success:false, message:"Already in your favourites!"});
    }
    else{
      user.saved_recipes.push(recipeId);
      user.save(function(error){
        if(error){
          throw error;
        }
        else{
          response.json({success:true, message:"Added to your favourites!"});
        }
      });
    }

  });
});
// app.get('/uploadedRecipes/:userid',function(request,response){
//   var userID=request.params.userid,
//   recipes.findOne({uploader:userID})
// });

app.get('/details/:userid',function (request,response) {
  var users = mongoose.model('users');
  var gfs=grid(mongoose.connection.db);
  var pro_pic='';

  users.findOne({userid:request.params.userid},function (err,user) {
    if (err) {
      throw err;
    }
    if (!user) {
      response.json({success:false, message:"Could not find user info"});
    }else {
      gfs.files.find({"metadata.profileID":user.profile_picture}).toArray(function (err, files) {
        var written=false;  //safegaurd against readstream.on('data') being called twice,as readstream reads files in chunks
        var readstream = gfs.createReadStream({
          filename:files[0].filename
        });
        readstream.on('data',function (data) {
        if (!written) {
          written=true;
          pro_pic = data.toString('base64');
        }
        });
        readstream.on('end',function () {
          var userinfo = {
            username : user.name,
            description : user.description,
            pro_pic : pro_pic
          };
          response.json({success:true, info:userinfo});
        });
        readstream.on('error',function () {
          console.log('error');
          response.json({success:false});
        });
      });//end find file`
    };//end else
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
});


app.post('/upload/data',function(request,response){

  var formData = request.body;
  if (formData.uuid == null || formData.uuid == '') {
    response.json({success : false, message : "Attach atleast one image/video"});
  }else{
    var recipe = new recipes({
      recipe_id: formData.uuid,
      recipe_name : formData.recipeName,
      ingredients : formData.ingredients,
      method : formData.method,
      comments : [],
      photos : [formData.uuid],
      videos : [formData.uuid],
      date : new Date(Date.now()).toDateString(),
      mealtype : formData.meal_type,
      cuisinetype : formData.cuisine_type,
      uploader : formData.uploader,
      other_ingre:formData.other_ingred,
      taste:formData.taste,
      time:formData.time,
      serves:formData.serves
    });

    recipe.save(function (err,recipe) {
      if (err) {
        console.log(err);
        response.json({success : false, message : "could not add recipe"});
      }
      if (recipe) {
        console.log("uploaded");
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
